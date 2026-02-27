const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function debugModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ No Found GEMINI_API_KEY in .env.local");
        return;
    }
    console.log(`🔑 Testing Key: ${key.substring(0, 10)}...`);

    const genAI = new GoogleGenerativeAI(key);

    console.log("📡 Attempting to list models directly (if supported)...");

    // We'll try to use a generic request to list models if the SDK specific method is tricky, 
    // but let's try the common models first with a specific 'hello' prompt to see which one bites.
    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-2.0-flash-exp",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-pro",
        "gemini-pro-vision"
    ];

    let success = false;

    for (const modelName of candidates) {
        process.stdout.write(`⏳ Testing ${modelName.padEnd(25)} `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'OK'");
            const response = await result.response;
            console.log(`✅ SUCCESS! Response: ${response.text().trim()}`);
            success = true;
            break; // Stop at first working model
        } catch (e) {
            let msg = e.message;
            if (msg.includes("404")) msg = "404 Not Found (Model not available for this key)";
            else if (msg.includes("403")) msg = "403 Forbidden (Quota or Location)";
            else if (msg.includes("400")) msg = "400 Bad Request";
            console.log(`❌ FAILED: ${msg.substring(0, 60)}...`);
        }
    }

    if (!success) {
        console.log("\n⚠️  ALL MODELS FAILED. This usually means:");
        console.log("1. The API Key was created in Google Cloud Console without enabling 'Generative Language API'.");
        console.log("2. The API Key is from Firebase (not AI Studio).");
        console.log("3. The project has no billing linked (sometimes required for Pro, but usually not for Flash).");
    }
}

debugModels();
