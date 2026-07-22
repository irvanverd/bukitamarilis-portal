import { NextResponse } from "next/server";

export async function GET() {

  const res = NextResponse.json({
    success: true,
  });

  res.cookies.delete("admin");

  return res;

}