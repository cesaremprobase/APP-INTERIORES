const https = require('https');

const url = 'https://image.pollinations.ai/prompt/test?width=1024&height=1024';

https.get(url, (res) => {
    console.log('Headers:', res.headers);
    console.log('Content-Type:', res.headers['content-type']);
}).on('error', (e) => {
    console.error(e);
});
