export interface JenisLomba {
    id: string;
    kategori: string;
    lomba: string;
  }
  
  export interface PesertaForm {
    alamat: string;
    namaPeserta: string;
    usia: number;
    kategori: string;
    noHp: string;
    jenisLomba: string[];
  }
  
  export interface DaftarResponse {
    success: boolean;
    message: string;
    idPeserta?: string;
  }
  
  export interface LombaResponse {
    success: boolean;
    data: JenisLomba[];
  }

  export interface PesertaResult{

    idPeserta:string;

    tanggal:string;

    alamat:string;

    namaPeserta:string;

    usia:number;

    kategori:string;

    noHp:string;

    lomba:string[];

}

export interface CekResponse{

    success:boolean;

    total:number;

    data:PesertaResult[];

}
export interface Peserta {

  idPeserta:string;
  tanggal:string;

  alamat:string;

  namaPeserta:string;

  usia:number;

  kategori:string;

  noHp:string;

  jenisLomba:string;

  status:string;

}