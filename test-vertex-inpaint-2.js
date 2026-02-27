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

        const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0-capability-001:predict`;

        const dummyImageBuffer = await sharp({
            create: { width: 1024, height: 1024, channels: 3, background: { r: 200, g: 0, b: 0 } }
        }).jpeg().toBuffer();

        const dummyMaskBuffer = await sharp({
            create: { width: 1024, height: 1024, channels: 3, background: { r: 255, g: 255, b: 255 } }
        }).jpeg().toBuffer();

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
                editConfig: {
                    editMode: 'inpainting-insert',
                    mask: { image: { bytesBase64Encoded: dummyMaskBuffer.toString('base64') } }
                }
            }
        };

        console.log("Sending to Vertex AI...");
        const apiRes = await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
        console.log('SUCCESS');
        if (apiRes.data.predictions) console.log('Returned images:', apiRes.data.predictions.length);
    } catch (e) {
        console.log("ERROR:");
        console.log(e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
    }
}
testEdit();
