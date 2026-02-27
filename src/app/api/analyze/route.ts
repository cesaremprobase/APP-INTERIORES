import { NextResponse } from 'next/server';
import { v1, helpers } from '@google-cloud/aiplatform';
import path from 'path';
import * as fs from 'fs';
import { analyzeRoomWithGemini } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File | null;
        const textureFile = formData.get('texture') as File | null;
        const maskBase64 = formData.get('mask') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'Falta la imagen original' }, { status: 400 });
        }

        console.log("Iniciando ruta de API tradicion /api/analyze...");

        // 0. Autenticación de Supabase (Server-Side)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error("Acceso denegado: Usuario no autenticado intentó usar la API.");
            return NextResponse.json({ error: 'No autorizado. Por favor inicie sesión para utilizar la IA.' }, { status: 401 });
        }
        // 1. Convert Image to Base64 and Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const imageBase64 = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';

        // 2. Texture handling (if provided)
        let textureHint = "resina epóxica (epoxy resin) brillante y lujosa";
        let textureBase64 = undefined;
        let textureMimeType = undefined;

        if (textureFile) {
            let rawName = textureFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
            if (rawName.length > 3) textureHint = rawName;

            const textureArrayBuffer = await textureFile.arrayBuffer();
            textureBase64 = Buffer.from(textureArrayBuffer).toString('base64');
            textureMimeType = textureFile.type;
        }

        // 3. Obtener Prompt Mejorado con Gemini
        let masterPrompt = 'A highly photorealistic interior design renovation room';
        try {
            console.log("Analizando imagen con Gemini...");
            const geminiOutput = await analyzeRoomWithGemini(
                imageBase64,
                mimeType,
                textureHint,
                textureBase64,
                textureMimeType
            );
            console.log("Respuesta Gemini:", geminiOutput);

            const promptMatch = geminiOutput.match(/"prompt"\s*:\s*"([^"]+)"/i);
            if (promptMatch && promptMatch[1]) {
                masterPrompt = promptMatch[1].replace(/\\n/g, ' ').replace(/\\"/g, '"');
            } else {
                masterPrompt = geminiOutput.substring(0, 1000);
            }
        } catch (e: any) {
            console.warn("Fallo Gemini, usando fallback.", e.message);
            masterPrompt = `High quality architectural photo, interior design, the floor is strictly ${textureHint}, realistic lighting, 8k resolution.`;
        }

        if (!masterPrompt.toLowerCase().includes('epoxy')) {
            masterPrompt += ' beautifully crafted seamless luxury epoxy resin floor.';
        }

        console.log("Master Prompt final:", masterPrompt);

        // 4. Conectar a Vertex AI usando el SDK ("Nano Banana" pipeline)
        console.log("Preparando ImageGenerationServiceClient de @google-cloud/aiplatform...");

        // IMPORTANTE: Asegúrate de tener './credenciales-gcp.json' en la raíz.
        const credentialsPath = process.cwd() + '/credenciales-gcp.json';

        // Leemos dinámicamente el proyecto del json porque saas-creador-interiores daba 403 Forbidden.
        let projectId = process.env.GOOGLE_CLOUD_PROJECT || 'saas-creador-interiores';

        const { PredictionServiceClient } = v1;
        const clientOptions: any = {
            apiEndpoint: 'us-central1-aiplatform.googleapis.com',
        };

        // Soporte para Vercel: Leer credenciales desde variable de entorno segura
        if (process.env.GCP_CREDENTIALS) {
            try {
                const creds = JSON.parse(process.env.GCP_CREDENTIALS);
                clientOptions.credentials = {
                    client_email: creds.client_email,
                    private_key: creds.private_key,
                };
                if (creds.project_id) projectId = creds.project_id;
            } catch (e) {
                console.error("Error parseando GCP_CREDENTIALS de Vercel", e);
            }
        } else {
            // Soporte Local: Leer archivo
            try {
                clientOptions.keyFilename = credentialsPath;
                const fileData = fs.readFileSync(credentialsPath, 'utf8');
                const creds = JSON.parse(fileData);
                if (creds.project_id) {
                    projectId = creds.project_id;
                }
            } catch (e) {
                console.warn("No se pudo leer el project_id del json local, usando fallback.");
            }
        }

        // Instanciar cliente
        const client = new PredictionServiceClient(clientOptions);

        const location = 'us-central1';
        const modelName = maskBase64 ? 'imagen-3.0-capability-001' : 'imagen-3.0-generate-001';
        const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/${modelName}`;

        const instance: any = {
            prompt: masterPrompt,
        };

        const parameters: any = {
            sampleCount: 1,
            // includeTransportConfidence: false,
        };

        // Si hay máscara, usamos inpainting, sino intentamos generar/editar normal
        if (maskBase64) {
            instance.referenceImages = [
                {
                    referenceId: 1,
                    referenceType: 'REFERENCE_TYPE_RAW',
                    referenceImage: { bytesBase64Encoded: imageBase64 }
                },
                {
                    referenceId: 2,
                    referenceType: 'REFERENCE_TYPE_MASK',
                    maskImageConfig: { maskMode: 'MASK_MODE_USER_PROVIDED' },
                    referenceImage: { bytesBase64Encoded: maskBase64 }
                }
            ];
            parameters.editConfig = {
                editMode: 'EDIT_MODE_INPAINT_INSERTION'
            };
        } else {
            instance.image = {
                bytesBase64Encoded: imageBase64,
            };
        }

        const request: any = {
            endpoint,
            instances: [helpers.toValue(instance)],
            parameters: helpers.toValue(parameters),
        };

        console.log("Llamando a client.predict() en Vertex AI...");

        const predictionResult = await client.predict(request) as any;
        const response = predictionResult[0];

        if (!response.predictions || response.predictions.length === 0) {
            throw new Error("No predictions returned from Vertex AI");
        }

        const predictionObj = helpers.fromValue(response.predictions[0]) as any;
        const resultBase64 = predictionObj?.bytesBase64Encoded || predictionObj?.bytesBase64;

        if (!resultBase64) {
            console.error("Invalid prediction:", predictionObj);
            throw new Error("Vertex AI returned an invalid prediction format");
        }

        let finalImageBase64 = resultBase64;

        // --- POST-PROCESAMIENTO: Preservación estricta de la habitación con Sharp ---
        if (maskBase64) {
            console.log("Integrando la foto original usando Sharp para evitar que Vertex modifique las paredes...");
            try {
                const sharp = (await import('sharp')).default;

                const originalBuffer = buffer;
                const maskBuffer = Buffer.from(maskBase64, 'base64');
                const generatedBuffer = Buffer.from(resultBase64, 'base64');

                const originalInfo = await sharp(originalBuffer).metadata();
                const width = originalInfo.width!;
                const height = originalInfo.height!;

                // 1. Invertir la máscara (lo blanco se pinta, lo negro se conserva)
                // Convertimos lo negro a blanco (opaco = conservar la original) y lo blanco a negro (transparente = mostrar IA)
                const alphaMask = await sharp(maskBuffer)
                    .resize(width, height, { fit: 'fill' })
                    .negate({ alpha: false })
                    .extractChannel(0) // Extrae un canal en escala de grises
                    .toBuffer();

                // 2. Recortar la imagen original usando la nueva máscara como transparencia
                const cutOriginal = await sharp(originalBuffer)
                    .resize(width, height, { fit: 'fill' })
                    .removeAlpha() // Asegurar 3 canales
                    .joinChannel(alphaMask) // Añade el cuarto (Alpha)
                    .toBuffer();

                // 3. Pegar la imagen original recortada sobre la imagen generada por IA
                const finalImageBuffer = await sharp(generatedBuffer)
                    .resize(width, height, { fit: 'fill' })
                    .composite([{ input: cutOriginal, blend: 'over' }])
                    .jpeg({ quality: 90 }) // Reducir un poco el peso
                    .toBuffer();

                finalImageBase64 = finalImageBuffer.toString('base64');
            } catch (err: any) {
                console.error("Error en Sharp (post-procesamiento):", err.message);
                // Si falla el post-procesamiento, devolvemos la imagen cruda de la IA como fallback
            }
        }

        const dataUri = `data:image/jpeg;base64,${finalImageBase64}`;

        return NextResponse.json({
            success: true,
            data: {
                image: dataUri,
                response: masterPrompt,
                description: "Diseño renderizado exitosamente por Vertex AI (ImageGeneration@006) usando API de Node.js."
            }
        });

    } catch (error: any) {
        console.error("Error en la API de generación:", error.message || error);
        return NextResponse.json({ success: false, error: error.message || 'Error interno en la generación' }, { status: 500 });
    }
}
