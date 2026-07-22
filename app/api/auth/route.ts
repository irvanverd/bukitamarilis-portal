import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  const body = await req.json();

  if (body.password !== process.env.ADMIN_PASSWORD) {

    return NextResponse.json({
      success: false,
      message: "Password salah"
    });

  }

  const res = NextResponse.json({
    success: true
  });

  // Simpan nama user
  res.cookies.set("admin_user", body.username || "Admin", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  // Penanda sudah login
  res.cookies.set("admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return res;
}