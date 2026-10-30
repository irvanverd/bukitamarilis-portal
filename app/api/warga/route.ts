import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "getListWarga";

  const appscriptUrl = process.env.NEXT_APPSCRIPT_API;

  if (!appscriptUrl) {
    return NextResponse.json(
      { success: false, message: "NEXT_APPSCRIPT_API belum disetel di server." },
      { status: 500 }
    );
  }

  try {
    const separator = appscriptUrl.includes("?") ? "&" : "?";
    const targetUrl = `${appscriptUrl}${separator}action=${action}`;

    const res = await fetch(targetUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menghubungi Apps Script" },
      { status: 500 }
    );
  }
}