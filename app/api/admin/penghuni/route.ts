import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminSession";

const API_URL = process.env.NEXT_APPSCRIPT_API;

function isAdmin(req: NextRequest) {
  return verifyAdminSession(req.cookies.get("admin_session")?.value);
}

async function callAppsScript(payload: Record<string, unknown>) {
  if (!API_URL) {
    return { ok: false, status: 500, data: { success: false, message: "Konfigurasi API belum tersedia." } };
  }

  const adminToken = process.env.PENGHUNI_ADMIN_TOKEN;
  if (!adminToken) {
    return { ok: false, status: 500, data: { success: false, message: "Token admin belum dikonfigurasi di server." } };
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...payload, adminToken }),
    cache: "no-store",
  });

  const text = await response.text();
  try {
    return { ok: response.ok, status: response.status, data: JSON.parse(text) as Record<string, unknown> };
  } catch {
    return { ok: false, status: 502, data: { success: false, message: "Respons Google Apps Script tidak valid." } };
  }
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, message: "Silakan login sebagai admin." }, { status: 401 });
  }

  try {
    const result = await callAppsScript({ action: "listPenghuniPending" });
    const success = result.data.success === true;
    return NextResponse.json(result.data, { status: success ? 200 : (result.status >= 400 ? result.status : 502) });
  } catch (error) {
    console.error("list penghuni error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data pendaftaran." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, message: "Silakan login sebagai admin." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = String(body.id ?? "").trim();
    const status = String(body.status ?? "").trim().toUpperCase();
    const catatanAdmin = String(body.catatanAdmin ?? "").trim();

    if (!id || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ success: false, message: "ID dan keputusan approval wajib valid." }, { status: 400 });
    }

    if (catatanAdmin.length > 500) {
      return NextResponse.json({ success: false, message: "Catatan maksimal 500 karakter." }, { status: 400 });
    }

    const result = await callAppsScript({
      action: "verifikasiPenghuni",
      id,
      status,
      catatanAdmin,
      verifiedBy: "Admin Portal",
    });
    const success = result.data.success === true;
    return NextResponse.json(result.data, { status: success ? 200 : (result.status >= 400 ? result.status : 400) });
  } catch (error) {
    console.error("verifikasi penghuni error:", error);
    return NextResponse.json({ success: false, message: "Keputusan approval gagal disimpan." }, { status: 500 });
  }
}
