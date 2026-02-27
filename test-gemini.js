const https = require('https');

const data = JSON.stringify({
  contents: [
    {
      role: "user",
      parts: [
        { text: "Explain how AI works in a few words" }
      ]
    }
  ]
});

const options = {
  hostname: 'aiplatform.googleapis.com',
  port: 443,
  path: '/v1/publishers/google/models/gemini-2.5-flash-lite:streamGenerateContent?key=AQ.Ab8RN6IC95VhjWQ4ASMJkQp7N-DRU7TnDiRQsT68teOnAuxQJA',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
