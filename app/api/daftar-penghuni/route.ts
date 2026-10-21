import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_APPSCRIPT_API;

export async function POST(req: NextRequest) {
  try {
    if (!API_URL) {
      return NextResponse.json(
        { success: false, message: "Konfigurasi API belum tersedia." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const namaPenghuni = String(body.namaPenghuni ?? "").trim();
    const blokAlamat = String(body.blokAlamat ?? "").trim();
    const noHp = String(body.noHp ?? "").trim();

    if (!namaPenghuni || !blokAlamat || !noHp) {
      return NextResponse.json(
        { success: false, message: "Nama, blok/alamat rumah, dan nomor HP wajib diisi." },
        { status: 400 }
      );
    }

    const hpDigits = noHp.replace(/\D/g, "");
    if (namaPenghuni.length > 120 || blokAlamat.length > 200 || hpDigits.length < 9 || hpDigits.length > 15) {
      return NextResponse.json(
        { success: false, message: "Periksa kembali nama, alamat, atau nomor HP." },
        { status: 400 }
      );
    }

    const upstream = await fetch(API_URL+ "?action=daftarPenghuni", {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "daftarPenghuni",
        namaPenghuni,
        blokAlamat,
        noHp,
      }),
      cache: "no-store",
    });

    const text = await upstream.text();
    let result: { success?: boolean; message?: string; id?: string; status?: string };
    try {
      result = JSON.parse(text);
    } catch {
      console.error("Apps Script returned non-JSON for daftarPenghuni");
      return NextResponse.json(
        { success: false, message: "Respons dari Google Apps Script tidak valid." },
        { status: 502 }
      );
    }

    return NextResponse.json(result, { status: upstream.ok ? 200 : 502 });
  } catch (error) {
    console.error("daftar-penghuni API error:", error);
    return NextResponse.json(
      { success: false, message: "Pendaftaran belum dapat diproses. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
