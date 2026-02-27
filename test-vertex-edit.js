const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

async function testEdit() {
    try {
        const auth = new GoogleAuth({
            keyFilename: './credenciales-gcp.json',
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const client = await auth.getClient();
        const projectId = await auth.getProjectId();
        const tokenRes = await client.getAccessToken();
        const token = tokenRes.token;

        // Testing imagen-3.0-generate-001 or imagen-3.0-capability-001
        const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict`;

        // Create a 1x1 white transparent PNG base64 string
        const dummyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

        const payload = {
            instances: [
                {
                    prompt: 'A living room but the floor is now red wood',
                    image: {
                        bytesBase64Encoded: dummyBase64
                    }
                }
            ],
            parameters: {
                sampleCount: 1,
                // Often 'editConfig' or something similar is used for image editing
                editConfig: {
                    editMode: 'inpainting-insert',
                    mask: {
                        image: {
                            bytesBase64Encoded: dummyBase64
                        }
                    }
                }
            }
        };

        const apiRes = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("SUCCESS:", Object.keys(apiRes.data));
    } catch (e) {
        if (e.response && e.response.data) {
            console.error("API ERROR:", JSON.stringify(e.response.data, null, 2));
        } else {
            console.error("NODE ERROR:", e.message);
        }
    }
}

testEdit();
