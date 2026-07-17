import { NextRequest, NextResponse } from "next/server";

const SHEETDB_URL =
    process.env.NEXT_PUBLIC_SHEETDB_URL!;

export async function GET(req: NextRequest) {

    const { searchParams } = new URL(req.url);

    const kegiatanId =
        searchParams.get("kegiatanId");

    const res = await fetch(
        `${SHEETDB_URL}?sheet=komentar`,
        {
            cache: "no-store",
        }
    );

    const data = await res.json();

    const result = data.filter(
        (x: any) =>
            x.KEGIATAN_ID == kegiatanId
    );

    return NextResponse.json(result);
}

export async function POST(req: NextRequest) {

    const body = await req.json();

    const payload = {
        data: [
            {
                ID: Date.now(),

                KEGIATAN_ID:
                    body.kegiatanId,

                NAMA:
                    body.nama,

                KOMENTAR:
                    body.komentar,

                TANGGAL:
                    new Date().toLocaleString(
                        "id-ID"
                    ),
            },
        ],
    };

    const res = await fetch(
        `${SHEETDB_URL}?sheet=komentar`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify(
                payload
            ),
        }
    );

    return NextResponse.json(
        await res.json()
    );
}