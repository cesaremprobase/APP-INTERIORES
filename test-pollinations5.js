const https = require('https');

// Test 1: image.pollinations.ai
const url1 = 'https://image.pollinations.ai/prompt/test?width=1024&height=1024';

// Test 2: pollinations.ai/prompt
const url2 = 'https://pollinations.ai/prompt/test?width=1024&height=1024';

const fetchUrl = (name, url) => {
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk.toString() });
        res.on('end', () => {
            console.log(`${name} [${res.statusCode}]: ${data.substring(0, 100)}`);
            console.log(`${name} Headers:`, res.headers['content-type']);
        });
    }).on('error', (e) => {
        console.error(e);
    });
};

fetchUrl('image.pollinations.ai', url1);
fetchUrl('pollinations.ai/prompt', url2);
