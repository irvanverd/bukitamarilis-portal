import { NextResponse } from "next/server";

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