const https = require('https');

const url = 'https://image.pollinations.ai/prompt/test?width=1024&height=1024';
// const url = 'https://pollinations.ai/p/test?width=1024&height=1024';

https.get(url, (res) => {
    res.on('data', chunk => {
        console.log('BODY:', chunk.toString().substring(0, 500));
    });
}).on('error', (e) => {
    console.error(e);
});
