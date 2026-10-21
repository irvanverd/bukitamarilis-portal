
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");

  return (
    left.length === right.length &&
    timingSafeEqual(left, right)
  );
}

function normalizePhone(value: string) {
  let phone = value.replace(/\D/g, "");

  if (phone.startsWith("0")) phone = "62" + phone.slice(1);
  if (phone.startsWith("8")) phone = "62" + phone;

  return phone;
}

export async function POST(req: NextRequest) {
  try {
    const { phone: inputPhone, otp, challengeToken } =
      await req.json();

    const secret = process.env.OTP_SECRET;

    if (!secret || !inputPhone || !otp || !challengeToken) {
      return NextResponse.json(
        { success: false, message: "Data verifikasi belum lengkap." },
        { status: 400 }
      );
    }

    const phone = normalizePhone(String(inputPhone));

    if (!/^\d{6}$/.test(String(otp))) {
      return NextResponse.json(
        { success: false, message: "Format OTP tidak valid." },
        { status: 400 }
      );
    }

    const parts = String(challengeToken).split(".");

    if (parts.length !== 2) {
      return NextResponse.json(
        { success: false, message: "Token OTP tidak valid." },
        { status: 400 }
      );
    }

    const [payload, signature] = parts;
    const expectedSignature = sign(payload, secret);

    if (!safeEqual(signature, expectedSignature)) {
      return NextResponse.json(
        { success: false, message: "Token OTP tidak valid." },
        { status: 400 }
      );
    }

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (data.expiresAt < Date.now()) {
      return NextResponse.json(
        { success: false, message: "OTP sudah kedaluwarsa. Silakan kirim ulang." },
        { status: 400 }
      );
    }

    if (data.phone !== phone) {
      return NextResponse.json(
        { success: false, message: "Nomor WhatsApp tidak sesuai." },
        { status: 400 }
      );
    }

    const submittedHash = sign(`${phone}:${otp}`, secret);

    if (!safeEqual(data.otpHash, submittedHash)) {
      return NextResponse.json(
        { success: false, message: "OTP salah." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Nomor WhatsApp berhasil diverifikasi.",
    });
  } catch (error) {
    console.error("OTP verify error:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat verifikasi OTP." },
      { status: 500 }
    );
  }
}
