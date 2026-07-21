import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_LOMBA_API!;

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);

  const kategori = searchParams.get("kategori");
const q = searchParams.get("q");
const action = searchParams.get("action");

  let url = API_URL;
  
  if (action  === "list") {

    url += "?action=list";
  
  } else

  if (q) {

    url += `?action=cek&q=${encodeURIComponent(q)}`;

  } else {

    url += `?action=lomba&kategori=${encodeURIComponent(
      kategori ?? ""
    )}`;

  }
  //console.log("API_URL :", API_URL);
  //console.log("q :", q);
  console.log("Final URL :", url);
  const res = await fetch(url,{
    cache:"no-store"
  });

  const json = await res.json();

  return NextResponse.json(json);
  

}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  return new NextResponse(text, {
    headers: { "Content-Type": "application/json" },
  });
}