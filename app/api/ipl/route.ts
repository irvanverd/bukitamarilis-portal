import { NextResponse } from "next/server";

// 1. GET: Mengambil riwayat & status transaksi IPL (getIPLlist)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const blokid = searchParams.get("blokid") || "";

  if (!blokid) {
    return NextResponse.json(
      { success: false, message: "Parameter blokid wajib disertakan." },
      { status: 400 }
    );
  }

  const appscriptUrl = process.env.NEXT_APPSCRIPT_API;

  if (!appscriptUrl) {
    return NextResponse.json(
      { success: false, message: "NEXT_APPSCRIPT_API belum dikonfigurasi di server." },
      { status: 500 }
    );
  }

  try {
    const separator = appscriptUrl.includes("?") ? "&" : "?";
    const targetUrl = `${appscriptUrl}${separator}action=getIPLlist&blokid=${encodeURIComponent(blokid)}`;

    const res = await fetch(targetUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil data IPL." },
      { status: 500 }
    );
  }
}

// 2. POST: Menyimpan / Rekonsiliasi Transaksi IPL (saveIPLTransaction)
export async function POST(request: Request) {
  const appscriptUrl = process.env.NEXT_APPSCRIPT_API;

  if (!appscriptUrl) {
    return NextResponse.json(
      { success: false, message: "NEXT_APPSCRIPT_API belum dikonfigurasi di server." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    // Pastikan action terdefinisi sebagai saveIPLTransaction jika belum ada
    const payload = {
      action: "saveIPLTransaction",
      ...body,
    };

    const res = await fetch(appscriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Apps Script HTTP Error ${res.status}`);
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menyimpan transaksi IPL ke Google Sheets." },
      { status: 500 }
    );
  }
}