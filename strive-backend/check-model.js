require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Testing API Key...");
    
    // Kita tidak bisa listing model langsung di SDK versi lama, tapi kita bisa tes generate simpel
    const result = await model.generateContent("Hello");
    console.log("✅ Success! Model 'gemini-1.5-flash' is working.");
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n--- PANDUAN PERBAIKAN ---");
    if (error.message.includes("404")) {
        console.log("1. API Key Anda mungkin valid, tapi tidak punya akses ke model ini.");
        console.log("2. Pastikan Anda membuat Key di **Google AI Studio** (aistudio.google.com), BUKAN Google Cloud Console.");
        console.log("3. Coba buat API Key baru di Project yang benar-benar baru di AI Studio.");
    } else if (error.message.includes("API key")) {
        console.log("API Key tidak terbaca atau salah. Cek file .env Anda.");
    }
  }
}

listModels();