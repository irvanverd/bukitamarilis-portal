import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const appscriptUrl = process.env.NEXT_APPSCRIPT_API;

    if (!appscriptUrl) {
      return NextResponse.json(
        { success: false, message: "NEXT_APPSCRIPT_API belum disetel di server." },
        { status: 500 }
      );
    }

    const res = await fetch(appscriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "changePassword",
        blokid: body.blokid,
        oldPassword: body.oldPassword,
        newPassword: body.newPassword,
        isFirstSet: body.isFirstSet || false,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengubah kata sandi." },
      { status: 500 }
    );
  }
}