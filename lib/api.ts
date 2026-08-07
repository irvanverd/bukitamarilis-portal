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
    `${process.env.NEXT_PUBLIC_LOMBA_API}?action=getKegiatan&id=${encodeURIComponent(id)}`,
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
    `${process.env.NEXT_PUBLIC_LOMBA_API}?action=listKegiatan`,
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
