import { NextResponse } from "next/server";

export async function GET() {

  const res = NextResponse.json({
    success: true,
  });

  res.cookies.delete("admin");
  res.cookies.delete("admin_user");
  return res;

}