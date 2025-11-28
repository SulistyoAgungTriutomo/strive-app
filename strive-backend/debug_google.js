// strive-backend/debug_google.js
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("🔍 Memeriksa koneksi ke Google AI...");
console.log(`🔑 Menggunakan API Key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'TIDAK DITEMUKAN'}`);

async function checkModels() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error("\n❌ Gagal Menghubungi Google:");
      console.error(`Status: ${response.status} ${response.statusText}`);
      console.error("Error:", JSON.stringify(data, null, 2));
      return;
    }

    console.log("\n✅ Koneksi Berhasil! Berikut model yang tersedia untuk Key Anda:");
    if (data.models) {
        data.models.forEach(m => {
            // Tampilkan hanya model yang bisa generate content
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                console.log(`- ${m.name.replace('models/', '')}`);
            }
        });
    } else {
        console.log("⚠️ Tidak ada model yang ditemukan.");
    }

  } catch (error) {
    console.error("\n❌ Terjadi kesalahan jaringan/script:");
    console.error(error);
  }
}

checkModels();