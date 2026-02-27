const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
const sharp = require('sharp');

async function testEdit() {
    try {
        const auth = new GoogleAuth({
            keyFilename: './credenciales-gcp.json',
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const client = await auth.getClient();
        const projectId = await auth.getProjectId();
        const token = (await client.getAccessToken()).token;

        // We will test `imagegeneration@006` first
        const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagegeneration@006:predict`;

        // 1. Create a dummy solid color 1024x1024 PNG image
        const dummyImageBuffer = await sharp({
            create: { width: 1024, height: 1024, channels: 3, background: { r: 200, g: 0, b: 0 } }
        }).png().toBuffer();

        // 2. Create a dummy mask 1024x1024 PNG
        const dummyMaskBuffer = await sharp({
            create: { width: 1024, height: 1024, channels: 3, background: { r: 255, g: 255, b: 255 } }
        }).png().toBuffer();

        const payload = {
            instances: [
                {
                    prompt: 'A living room but the floor is now red wood',
                    image: {
                        bytesBase64Encoded: dummyImageBuffer.toString('base64')
                    }
                }
            ],
            parameters: {
                sampleCount: 1,
                mode: 'edit',
                mask: {
                    image: { bytesBase64Encoded: dummyMaskBuffer.toString('base64') }
                }
            }
        };

        const apiRes = await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
        console.log('SUCCESS @006');
        if (apiRes.data.predictions && apiRes.data.predictions[0].bytesBase64Encoded) {
            console.log("Got modified image back! Length:", apiRes.data.predictions[0].bytesBase64Encoded.length);
        }
    } catch (e) {
        console.log("ERROR @006:");
        console.log(e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
    }
}
testEdit();
