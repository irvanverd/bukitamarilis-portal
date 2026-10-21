import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("admin");
  res.cookies.delete("admin_user");
  res.cookies.delete("admin_ui");
  res.cookies.delete("admin_session");
  return res;
}
