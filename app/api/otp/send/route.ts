
import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomInt } from "crypto";

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function normalizePhone(value: string) {
  let phone = value.replace(/\D/g, "");

  if (phone.startsWith("0")) phone = "62" + phone.slice(1);
  if (phone.startsWith("8")) phone = "62" + phone;

  return phone;
}

export async function POST(req: NextRequest) {
  try {
    const { phone: inputPhone } = await req.json();

    if (!inputPhone) {
      return NextResponse.json(
        { success: false, message: "Nomor WhatsApp wajib diisi." },
        { status: 400 }
      );
    }

    const phone = normalizePhone(String(inputPhone));

    if (!/^628\d{7,11}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "Nomor WhatsApp tidak valid." },
        { status: 400 }
      );
    }

    const fonnteToken = process.env.FONNTE_TOKEN;
    const otpSecret = process.env.OTP_SECRET;

    if (!fonnteToken || !otpSecret) {
      return NextResponse.json(
        { success: false, message: "Konfigurasi OTP belum lengkap." },
        { status: 500 }
      );
    }

    const otp = randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    const otpHash = sign(`${phone}:${otp}`, otpSecret);

    const payload = Buffer.from(
      JSON.stringify({ phone, otpHash, expiresAt })
    ).toString("base64url");

    const signature = sign(payload, otpSecret);
    const challengeToken = `${payload}.${signature}`;

    const form = new URLSearchParams({
      target: phone,
      message: `Kode OTP WebPortal MyAmarilis: ${otp}. Berlaku 5 menit. Jangan berikan kode ini kepada siapa pun.`,
    });

    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: fonnteToken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
      cache: "no-store",
    });

    const raw = await response.text();

    let result: any;
    
    try {
      result = JSON.parse(raw);
    } catch {
      result = { responseText: raw.slice(0, 500) };
    }
    
    // Debug hanya di log server, jangan log token Fonnte.
    console.error("Fonnte HTTP status:", response.status);
    console.error("Fonnte response:", result);
    
    const sendSuccess =
      response.ok &&
      (result.status === true || result.status === "true");
    
    if (!sendSuccess) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengirim OTP WhatsApp. Periksa log server.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP berhasil dikirim ke WhatsApp.",
      challengeToken,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("OTP send error:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat mengirim OTP." },
      { status: 500 }
    );
  }
}
