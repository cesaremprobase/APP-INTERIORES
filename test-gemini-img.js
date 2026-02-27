const https = require('https');

const API_KEY = "AQ.Ab8RN6IC95VhjWQ4ASMJkQp7N-DRU7TnDiRQsT68teOnAuxQJA"
const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:streamGenerateContent?key=${API_KEY}`

const payload = {
    contents: [
        {
            role: "user",
            parts: [
                { text: "Generate a blue square image. Output the raw base64 string and nothing else." }
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
