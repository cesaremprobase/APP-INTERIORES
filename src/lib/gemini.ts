// src/lib/gemini.ts

export async function analyzeRoomWithGemini(
    base64Image: string,
    mimeType: string,
    textureHint: string,
    textureBase64?: string,
    textureMimeType?: string
): Promise<string> {
    const API_KEY = "AQ.Ab8RN6IC95VhjWQ4ASMJkQp7N-DRU7TnDiRQsT68teOnAuxQJA"
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${API_KEY}`

    const promptText = `
You are an expert AI designer. The user has provided an image of their room.
They also provided an image or description of the floor texture they want.
Your task is to analyze these images and create a highly detailed, descriptive PERFECT prompt in ENGLISH for a Diffusion Image Generator (like Stable Diffusion or Midjourney).
The prompt must describe the original room exactly as it is (lighting, furniture, architecture) but perfectly seamlessly integrate the NEW FLOOR texture they requested.
Make the prompt highly photorealistic, 8k, architectural photography style.
You MUST output your response as a valid JSON object without markdown formatting.
The JSON object must have exactly this key:
1. "prompt": The English prompt string for the image generator.
`

    const parts = [
        { text: promptText },
        {
            inlineData: {
                mimeType: mimeType,
                data: base64Image
            }
        }
    ]

    if (textureBase64 && textureMimeType) {
        parts.push({
            inlineData: {
                mimeType: textureMimeType,
                data: textureBase64
            }
        })
    } else {
        parts.push({ text: `Textura solicitada: ${textureHint} ` })
    }

    const payload = {
        contents: [
            {
                role: "user",
                parts: parts
            }
        ]
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Gemini API Error:', errorText)
            throw new Error(`Gemini API failed: ${response.status} `)
        }

        const data = await response.json()

        // Handling streamGenerateContent response format (array of chunks)
        let generatedText = ''
        if (Array.isArray(data)) {
            for (const chunk of data) {
                if (chunk.candidates && chunk.candidates[0]?.content?.parts) {
                    generatedText += chunk.candidates[0].content.parts[0].text
                }
            }
        } else if (data.candidates && data.candidates[0]?.content?.parts) {
            generatedText = data.candidates[0].content.parts[0].text
        }

        return generatedText.trim()
    } catch (error) {
        console.error('Error calling Gemini REST API:', error)
        return `Hyperrealistic interior design renovation, floor transformed into ${textureHint}, perfect mirror reflection, luxury finish, preserving original room geometry, 8k architectural photography, bright lighting`
    }
}
