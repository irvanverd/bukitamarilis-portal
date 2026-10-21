import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_TTL_SECONDS, createAdminSession } from "@/lib/adminSession";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const configuredPassword = process.env.ADMIN_PASSWORD;

    if (!configuredPassword) {
      return NextResponse.json(
        { success: false, message: "Password admin belum dikonfigurasi di server." },
        { status: 500 }
      );
    }

    if (typeof body.password !== "string" || body.password !== configuredPassword) {
      return NextResponse.json(
        { success: false, message: "Password salah." },
        { status: 401 }
      );
    }

    const username = String(body.username || "Admin").trim().slice(0, 80) || "Admin";
    const res = NextResponse.json({ success: true, username });
    const secure = process.env.NODE_ENV === "production";

    // Cookie bertanda tangan, divalidasi server untuk route admin.
    res.cookies.set("admin_session", createAdminSession(username), {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_TTL_SECONDS,
    });

    // Cookie lama tetap dipasang agar UI admin yang sudah ada tidak rusak.
    res.cookies.set("admin_user", username, {
      httpOnly: false,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_TTL_SECONDS,
    });
    res.cookies.set("admin_ui", "1", {
      httpOnly: false,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_TTL_SECONDS,
    });
    res.cookies.set("admin", "1", {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_TTL_SECONDS,
    });

    return res;
  } catch (error) {
    console.error("Admin authentication error:", error);
    return NextResponse.json(
      { success: false, message: "Permintaan login tidak valid." },
      { status: 400 }
    );
  }
}
