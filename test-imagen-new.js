const https = require('https');

const API_KEY = "AIzaSyCxB8BID0-x_t-SL4np6d5TRttBs4ky_5I"
const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${API_KEY}`

async function testCombination() {
    const payload = {
        instances: [
            { prompt: "A completely white empty room with a wooden floor" }
        ],
        parameters: {
            sampleCount: 1
        }
    }

    const req = https.request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, res => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => console.log('Status:', res.statusCode, '\nResponse:', data.substring(0, 500)));
    });

    req.write(JSON.stringify(payload));
    req.end();
}

testCombination();
