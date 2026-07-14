import { NextRequest, NextResponse } from "next/server";

const SHEETDB_URL = process.env.NEXT_PUBLIC_SHEETDB_URL!;

interface Pendaftaran {
  id : string;
  idKegiatan: string;
  tanggal: string;
  nama: string;
  alamat: string;
  nomorHP: string;
  jenisDaftar: string;
  keterangan: string;
  status: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
 
      idKegiatan,
      nama,
      alamat,
      nomorHP,
      jenisDaftar,
      keterangan,
      status,
    } = body;

    if (
      !idKegiatan ||
      !nama ||
      !alamat ||
      !nomorHP
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data belum lengkap.",
        },
        {
          status: 400,
        }
      );
    }

    //
    // Cek apakah nomor HP sudah pernah daftar
    // pada kegiatan yang sama
    //

    const check = await fetch(
      `${SHEETDB_URL}/search?sheet=pendaftaran&idKegiatan=${encodeURIComponent(
        idKegiatan
      )}&nomorHP=${encodeURIComponent(
        nomorHP
      )}`,
      {
        cache: "no-store",
      }
    );

    const checkData = check.ok
      ? await check.json()
      : [];

    if (Array.isArray(checkData) && checkData.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nomor HP sudah terdaftar pada kegiatan ini.",
        },
        {
          status: 409,
        }
      );
    }

    //
    // Generate ID
    //

    const id =
      "REG-" +
      Date.now().toString();

    const tanggal = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const data: Pendaftaran = {
      id,
      tanggal,
      idKegiatan,
      nama,
      alamat,
      nomorHP,
      jenisDaftar,
      keterangan,
      status: "OPEN",
    };

    //
    // Simpan ke SheetDB
    //

    const insert = await fetch(
        `${SHEETDB_URL}?sheet=pendaftaran`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: data,
          }),
        }
      );

    if (!insert.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gagal menyimpan data.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Pendaftaran berhasil.",
      idRegistrasi: id,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );
  }
}