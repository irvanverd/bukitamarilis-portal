import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_LOMBA_API!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const kegiatanId = searchParams.get("kegiatanId");

  const url =
    `${API_URL}?action=getKomentar&id=${encodeURIComponent(kegiatanId ?? "")}`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  const text = await res.text();

  return new NextResponse(text, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(req: NextRequest) {

  const body = await req.json();

  const res = await fetch(API_URL + "?action=addcomment", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  return new NextResponse(text, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}