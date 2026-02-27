const https = require('https');

const API_KEY = "AQ.Ab8RN6IC95VhjWQ4ASMJkQp7N-DRU7TnDiRQsT68teOnAuxQJA"
const models = ['gemini-2.5-flash', 'gemini-3.0-flash', 'gemini-2.0-flash-exp', 'gemini-2.5-pro']

async function testModel(model) {
    const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:streamGenerateContent?key=${API_KEY}`

    return new Promise((resolve) => {
        const req = https.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                console.log(`[${model}] Status: ${res.statusCode}`);
                if (res.statusCode !== 200) console.log(data.substring(0, 200));
                resolve();
            });
        });

        req.write(JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "hi" }] }]
        }));
        req.end();
    })
}

async function run() {
    for (const m of models) await testModel(m);
}
run();
