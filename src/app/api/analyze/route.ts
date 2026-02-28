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

        // AUTO-CORRECCIÓN: Si el usuario no existe en la tabla profiles (porque no se corrió el trigger SQL), lo creamos.
        try {
            const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single();
            if (!profile) {
                await supabase.from('profiles').insert({
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                    avatar_url: user.user_metadata?.avatar_url || ''
                });
                console.log("Perfil de Supabase creado automáticamente para el usuario.");
            }
        } catch (e: any) {
            console.warn("Error al auto-crear perfil:", e.message);
        }

        // 1. Convert Image to Buffer and Reduce dimensions memory-safely (Fixes "Failed to fetch" Crash)
        const arrayBuffer = await file.arrayBuffer();
        let buffer: Buffer = Buffer.from(arrayBuffer);

        try {
            const sharp = (await import('sharp')).default;
            const processedBuffer = await sharp(buffer)
                .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 90 })
                .toBuffer();
            buffer = processedBuffer;
        } catch (e) {
            console.warn("Sharp no disponible para redimensionar, usando imagen original.");
        }

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
                let rawEnv = process.env.GCP_CREDENTIALS.trim();

                // Si Vercel encerró todo el JSON en comillas extra (doblemente serializado)
                if (rawEnv.startsWith('"') && rawEnv.endsWith('"')) {
                    rawEnv = JSON.parse(rawEnv); // Esto deserializa las comillas y los \n escapados
                }

                // Si Vercel devuelve un string crudo normal
                const creds = typeof rawEnv === 'string' ? JSON.parse(rawEnv) : rawEnv;

                if (!creds.client_email || !creds.private_key) {
                    throw new Error("El JSON no contiene 'client_email' o 'private_key'.");
                }

                // Escribir el key a un archivo temporal local en Vercel para una inicialización infalible
                const tmpPath = path.join('/tmp', 'gcp-creds.json');
                fs.writeFileSync(tmpPath, JSON.stringify(creds));
                clientOptions.keyFilename = tmpPath;

                if (creds.project_id) {
                    projectId = creds.project_id;
                    clientOptions.projectId = creds.project_id; // Forzar el ID en las opciones del cliente
                }
            } catch (e: any) {
                console.error("Vercel GCP_CREDENTIALS Parsing Error:", e.message);
                // Lanza el error directamente para que apunte a la variable mal configurada en Vercel
                throw new Error("Tus credenciales GCP_CREDENTIALS en Vercel no tienen un formato JSON válido. Asegúrate de copiar y pegar todo el archivo exacto. Detalles: " + e.message);
            }
        } else {
            // Soporte Local: Leer archivo
            try {
                if (!fs.existsSync(credentialsPath)) {
                    throw new Error(`Falta la variable de entorno GCP_CREDENTIALS y tampoco se encontró el archivo local: ${credentialsPath}`);
                }
                clientOptions.keyFilename = credentialsPath;
                const fileData = fs.readFileSync(credentialsPath, 'utf8');
                const creds = JSON.parse(fileData);
                if (creds.project_id) {
                    projectId = creds.project_id;
                    clientOptions.projectId = creds.project_id;
                }
            } catch (e: any) {
                console.error("Error cargando credenciales locales:", e.message);
                throw new Error("¡FALTA LA VARIABLE GCP_CREDENTIALS! Si estás en Vercel, asegúrate de que creaste una variable llamada exactamente GCP_CREDENTIALS en Settings > Environment Variables, que esté marcada para el entorno 'Production' y que hayas hecho un Redeploy.");
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

        const dataUri = `data:image/jpeg;base64,${resultBase64}`;

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
