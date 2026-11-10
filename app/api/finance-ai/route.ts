import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { detailKeuangan, bulanDipilih } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum dikonfigurasi di file environment." },
        { status: 500 }
      );
    }

    const prompt = `
Analisis keuangan kas RT 07 RW 14 periode ${bulanDipilih}.
Data mutasi akun pada bulan ini:
${JSON.stringify(detailKeuangan)}

Berikan kesimpulan cepat dan ringkas (maksimal 100 kata) dalam 3 poin:
1. Posisi Kas & Likuiditas (Surplus/Defisit).
2. Pos Beban Terbesar yang Perlu Diperhatikan.
3. Saran Cepat untuk Pengurus.
Gunakan bahasa Indonesia lugas.
`;

    // Daftar prioritas model: jika model pertama sibuk (503/high demand), otomatis beralih ke model berikutnya
    const MODELS_TO_TRY = [
      "gemini-2.0-flash",
      "gemini-2.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-2.0-flash-lite",
    ];

    let lastErrorMessage = "";

    for (const modelName of MODELS_TO_TRY) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 300,
              temperature: 0.1,
            },
          }),
        });

        const data = await response.json();

        // Jika respons sukses
        if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const text = data.candidates[0].content.parts[0].text;
          return NextResponse.json({ success: true, analysis: text, modelUsed: modelName });
        }

        // Simpan pesan error dan lanjutkan ke model berikutnya di array
        lastErrorMessage = data?.error?.message || `HTTP ${response.status} pada ${modelName}`;
        console.warn(`Model ${modelName} gagal (${response.status}): ${lastErrorMessage}. Mencoba model alternatif...`);
      } catch (err: any) {
        lastErrorMessage = err.message;
        console.warn(`Fetch error pada ${modelName}:`, err);
      }
    }

    // Jika seluruh model dalam daftar gagal
    return NextResponse.json(
      { error: `Server Gemini sedang sibuk di seluruh cluster. Detail: ${lastErrorMessage}` },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Gagal generate analisa AI:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal: " + error.message },
      { status: 500 }
    );
  }
}