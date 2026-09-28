import { PesertaForm } from "@/types/lomba";

export async function getJenisLomba(kategori: string) {
    const res = await fetch(
      `/api/lomba?kategori=${encodeURIComponent(kategori)}`
    );
  
    return (await res.json()).data;
  }
  
  export async function daftarPeserta(data: PesertaForm) {
    const res = await fetch("/api/lomba?action=daftar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    return await res.json();
  }

  export async function cekPeserta(keyword:string){

    const res = await fetch(

        `/api/lomba?q=${encodeURIComponent(keyword)}`

    );

    return await res.json();

}
export async function getKegiatan(id: string) {
  const res = await fetch(
    `${process.env.NEXT_APPSCRIPT_API}?action=getKegiatan&id=${encodeURIComponent(id)}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Gagal mengambil kegiatan");
  }

  const json = await res.json();

  return json.data;
}

export async function getListKegiatan() {

  const res = await fetch(
    `${process.env.NEXT_APPSCRIPT_API}?action=listKegiatan`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Gagal mengambil kegiatan");
  }

  const json = await res.json();

  return json.data ?? [];
}

export async function getFinanceData() {
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;

  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  const text = await response.text();

  const json = JSON.parse(
    text.substring(47).slice(0, -2)
  );

  const rows = json.table.rows;

  return rows.map((row: any) => ({
    Tahun: row.c[0]?.v ?? "",
    bulan: row.c[1]?.v ?? "",
    pemasukan: Number(row.c[2]?.v ?? 0),
    pengeluaran: Number(row.c[3]?.v ?? 0),
    saldo: Number(row.c[4]?.v ?? 0),

  }));
}


export async function getListPeserta() {

  const res = await fetch("/api/lomba?action=list", {
    cache: "no-store",
  });

  console.log("Status :", res.status);

  const text = await res.text();

  console.log("Response :", text);

  if (!text.trim()) {
    throw new Error("Response kosong dari server.");
  }

  return JSON.parse(text);

}



export async function updatePeserta(data: any) {
  const res = await fetch("/api/lomba?action=update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}
