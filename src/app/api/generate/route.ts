import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { analyzeRoomWithGemini } from '@/lib/gemini';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { imageBase64, maskBase64, textureHint } = body;

        if (!imageBase64) {
            return NextResponse.json({ error: 'Falta la imagen original' }, { status: 400 });
        }

        // 1. Opcional: Usar Gemini para mejorar el prompt. 
        // Si el usuario quiere resina epóxica, lo forzamos en el prompt.
        const finalTextureHint = textureHint || "resina epóxica (epoxy resin) brillante y lujosa";

        // Extraemos mimeType falso ya que Gemini lo pide (o asume jpeg)
        let prompt = "";
        try {
            console.log("Analizando con Gemini...");
            prompt = await analyzeRoomWithGemini(
                imageBase64,
                "image/jpeg",
                finalTextureHint
            );
            console.log("Prompt de Gemini generado:", prompt);

            // Si la respuesta es JSON, lo parseamos
            try {
                const parsed = JSON.parse(prompt);
                if (parsed.prompt) prompt = parsed.prompt;
            } catch (e) {
                // Ignorar si no es JSON, asumir que es texto crudo
            }
        } catch (e) {
            console.warn("Fallo el análisis de Gemini, usando prompt fallback");
            prompt = `High quality architectural photo, interior design, the floor is strictly ${finalTextureHint}, realistic lighting, 8k resolution.`;
        }

        // Asegurarnos de que el prompt tenga instrucción de resina
        if (!prompt.toLowerCase().includes('epoxy')) {
            prompt += ' with seamless luxury epoxy resin floor.';
        }

        // 2. Conectar a Vertex AI para generar/editar
        console.log("Preparando Inpainting/Generation con Vertex AI Imagen 3...");
        const auth = new GoogleAuth({
            keyFilename: './credenciales-gcp.json',
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const client = await auth.getClient();
        const projectId = await auth.getProjectId();
        const tokenRes = await client.getAccessToken();
        const token = tokenRes.token;

        const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0-capability-001:predict`;

        // Preparar el payload. Si hay mascara usamos inpainting, sino usar text-to-image o algo crudo
        // Lo ideal es tener máscara para el piso. Si no, Vertex AI puede fallar en inpainting puro sin mascara selectiva.
        // Asumiremos que el frontend o un pre-proceso nos dio `maskBase64` (blanco en el piso, negro resto)

        const vertexPayload: any = {
            instances: [
                {
                    prompt: prompt,
                    image: {
                        bytesBase64Encoded: imageBase64
                    }
                }
            ],
            parameters: {
                sampleCount: 1,
            }
        };

        if (maskBase64) {
            vertexPayload.instances[0].mask = {
                image: {
                    bytesBase64Encoded: maskBase64
                }
            };
            vertexPayload.instances[0].editConfig = {
                editMode: 'inpainting-insert'
            };
        } else {
            // Si no hay mascara, intentar product-image o edit guiado por texto puro (Imagen 3 a veces lo permite)
            vertexPayload.instances[0].editConfig = {
                editMode: 'inpainting-insert' // Requiere mascara usualmente, quiza falle. Idealmente enviar mascara 100% o auto-generada.
            };
        }

        console.log("Enviando request a Vertex AI...");
        const apiRes = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vertexPayload)
        });

        if (!apiRes.ok) {
            const errorText = await apiRes.text();
            console.error('Vertex API Error:', errorText);
            return NextResponse.json({ error: 'Fallo la generación', details: errorText }, { status: apiRes.status });
        }

        const data = await apiRes.json();

        if (data.predictions && data.predictions.length > 0) {
            const resultBase64 = data.predictions[0].bytesBase64Encoded;
            return NextResponse.json({ success: true, resultImage: resultBase64, promptUsed: prompt });
        } else {
            return NextResponse.json({ error: 'Vertex no retornó predicciones', data }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Error en el endpoint de generación:", error);
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
    }
}
