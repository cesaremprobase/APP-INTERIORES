const https = require('https');

const API_KEY = "AQ.Ab8RN6IC95VhjWQ4ASMJkQp7N-DRU7TnDiRQsT68teOnAuxQJA"
const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash:streamGenerateContent?key=${API_KEY}`

async function testCombination() {
    const promptText = `
You are an expert AI designer. The user has provided an image of their room.
Your task is to combine these two images professionally, replacing the floor in the room with the new texture.
You MUST output your response as a valid JSON object without markdown formatting.
The JSON object must have exactly these two keys:
1. "image": A raw base64 data URL string (e.g., "data:image/jpeg;base64,/9j/4AAQSp...") representing the combined image. Generate the image content in this field.
2. "description": A highly detailed professional explanation in Spanish of the new room.
`
    const payload = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: promptText }
                ]
            }
        ]
    }

    const req = https.request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, res => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => console.log(data));
    });

    req.write(JSON.stringify(payload));
    req.end();
}

testCombination();
