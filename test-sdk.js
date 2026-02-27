const { VertexAI } = require('@google-cloud/vertexai');
const sharp = require('sharp');

async function testEdit() {
    try {
        const projectId = 'gen-lang-client-0953621425';
        const location = 'us-central1';

        // Set GOOGLE_APPLICATION_CREDENTIALS for the SDK
        process.env.GOOGLE_APPLICATION_CREDENTIALS = './credenciales-gcp.json';

        const vertex_ai = new VertexAI({ project: projectId, location: location });

        // Try to init the model, but vertex_ai is mostly for generativeLanguage (Gemini)
        // Wait, recent updates allow generativeImage models? Let's check docs or try.
        console.log("SDK keys:", Object.keys(vertex_ai));

        if (typeof vertex_ai.preview?.getGenerativeModel === 'function' || typeof vertex_ai.getGenerativeModel === 'function') {
            // ...
        }
    } catch (e) {
        console.log("ERROR SDK:");
        console.log(e.message);
    }
}
testEdit();
