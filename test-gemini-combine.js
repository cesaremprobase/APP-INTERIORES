const https = require('https');
const fs = require('fs');

const API_KEY = "AQ.Ab8RN6IC95VhjWQ4ASMJkQp7N-DRU7TnDiRQsT68teOnAuxQJA"
const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:streamGenerateContent?key=${API_KEY}`

async function testCombination() {
    const payload = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: "Combine the two images provided and return the raw output as a base64 JPEG string representing the combined image. Output nothing else." }
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
