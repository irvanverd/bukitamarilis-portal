import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { chartData, topPengeluaran, topPenerimaan, bulanDipilih } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum dikonfigurasi di file environment (.env.local)." },
        { status: 500 }
      );
    }

    const prompt = `
Analisis ringkas dan cepat untuk kas warga RT 07 RW 14 periode ${bulanDipilih}:
Arus Kas: ${JSON.stringify(chartData)}
Top Beban: ${JSON.stringify(topPengeluaran)}
Top Pemasukan: ${JSON.stringify(topPenerimaan)}

Berikan kesimpulan langsung to-the-point (maksimal 150 kata) dalam 3 poin:
1. Kondisi Likuiditas (Surplus/Defisit).
2. Beban Terbesar & Evaluasinya.
3. Rekomendasi Aksi Cepat.
Gunakan bahasa Indonesia lugas.
`;

    const MODEL_NAME = "gemini-3.8-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 450, // Mempercepat output secara drastis
          temperature: 0.2,     // Mengurangi latensi komputasi
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error Detail:", data);
      return NextResponse.json(
        { error: data?.error?.message || "Terjadi kesalahan pada respon Gemini API." },
        { status: response.status }
      );
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Analisis tidak tersedia.";

    return NextResponse.json({ success: true, analysis: text });
  } catch (error: any) {
    console.error("Gagal generate analisa AI:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat memproses analisa AI: " + error.message },
      { status: 500 }
    );
  }
}