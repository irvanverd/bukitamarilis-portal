import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {

  if (req.nextUrl.pathname.startsWith("/list-peserta")) {

    const admin = req.cookies.get("admin");

    if (!admin) {
      return NextResponse.redirect(
        new URL("/admin_lomba", req.url)
      );
    }

  }

  return NextResponse.next();

}

export const config = {
  matcher: ["/list-peserta/:path*"],
};