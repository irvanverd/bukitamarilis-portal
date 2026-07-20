import { PesertaForm } from "@/types/lomba";
export async function getJenisLomba(kategori: string) {
    const res = await fetch(
      `/api/lomba?kategori=${encodeURIComponent(kategori)}`
    );
  
    return (await res.json()).data;
  }
  
  export async function daftarPeserta(data: PesertaForm) {
    const res = await fetch("/api/lomba", {
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