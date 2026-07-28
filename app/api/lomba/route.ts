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
  const response = await fetch(url);

const text = await response.text();

if (!text.trim()) {

    return Response.json(
        {
            success:false,
            message:"Apps Script tidak mengirim response."
        },
        {
            status:500
        }
    );

}

return new Response(text,{
    headers:{
        "Content-Type":"application/json"
    }
});
  

}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Ambil parameter action dari URL
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  // URL default (daftar peserta)
  let url = API_URL;

  // Jika update, tambahkan action=update
  if (action === "update") {
    url += "?action=update";
  }

  const res = await fetch(url, {
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