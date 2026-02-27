const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

async function test() {
    try {
        const auth = new GoogleAuth({
            keyFilename: './credenciales-gcp.json',
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const client = await auth.getClient();
        const projectId = await auth.getProjectId();
        const tokenRes = await client.getAccessToken();
        const token = tokenRes.token;

        console.log('Authenticated! Project ID:', projectId);
        console.log('Token ready, calling Imagen 3...');

        // us-central1 is the standard region for Imagen
        const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict`;

        const payload = {
            instances: [
                { prompt: 'A small cute perfectly white cat on a white background, 8k resolution' }
            ],
            parameters: {
                sampleCount: 1,
                // Optional params: aspectRatio, outputOptions, personGeneration
            }
        };

        const apiRes = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (apiRes.data.predictions && apiRes.data.predictions[0].bytesBase64Encoded) {
            console.log('SUCCESS! Image received. Base64 length:', apiRes.data.predictions[0].bytesBase64Encoded.length);
        } else {
            console.log('Response format unknown:', Object.keys(apiRes.data));
        }

    } catch (e) {
        console.error('Error connecting to Vertex AI:');
        if (e.response && e.response.data) {
            console.error(JSON.stringify(e.response.data, null, 2));
        } else {
            console.error(e.message);
        }
    }
}

test();
