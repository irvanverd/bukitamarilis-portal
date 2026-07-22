"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PesertaList {
  idPeserta: string;
  namaPeserta: string;
  alamat: string;
  usia: number;
  kategori: string;
  jenisLomba: string;
  status: string;
}

type Group = {
  [kategori: string]: {
    [lomba: string]: PesertaList[];
  };
};

/**
 * Group Peserta
 */
function buildGroup(data: PesertaList[]): Group {
  const result: Group = {};

  data.forEach((item) => {
    const kategori = item.kategori || "-";

    if (!result[kategori]) {
      result[kategori] = {};
    }

    const lombaList = String(item.jenisLomba)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    lombaList.forEach((lomba) => {
      if (!result[kategori][lomba]) {
        result[kategori][lomba] = [];
      }

      result[kategori][lomba].push(item);
    });
  });

  return result;
}

/**
 * Generate PDF List Peserta
 */
export function generateListPDF(
  data: PesertaList[],
  kategori: string,
  jenisLomba: string
) {

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const today = new Date().toLocaleString("id-ID");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);

  pdf.text(
    "DAFTAR PESERTA LOMBA HUT RI",
    105,
    15,
    {
      align: "center",
    }
  );

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  pdf.text(
    `Kategori : ${kategori}`,
    14,
    25
  );

  pdf.text(
    `Jenis Lomba : ${jenisLomba}`,
    14,
    31
  );

  pdf.text(
    `Total Peserta : ${data.length}`,
    14,
    37
  );

  pdf.text(
    `Dicetak : ${today}`,
    150,
    37
  );

  let y = 45;

  /**
   * =====================================================
   * FILTER BIASA
   * =====================================================
   */

  if (
    kategori !== "Semua" &&
    jenisLomba !== "Semua"
  ) {

    autoTable(pdf, {
      startY: y,

      head: [[
        "No",
        "Nama",
        "Alamat",
        "Usia",
        "Status",
      ]],

      body: data.map((item, i) => [
        i + 1,
        item.namaPeserta,
        item.alamat,
        item.usia,
        item.status,
      ]),

      styles: {
        fontSize: 9,
      },

      headStyles: {
        fillColor: [220, 38, 38],
      },
    });

    pdf.save("Daftar-Peserta.pdf");
    return;
  }

  /**
   * =====================================================
   * GROUPING
   * =====================================================
   */

  const group = buildGroup(data);
  /**
 * =====================================================
 * CETAK BERDASARKAN GROUP
 * =====================================================
 */

const kategoriList = Object.keys(group).sort();

kategoriList.forEach((namaKategori, indexKategori) => {

  // halaman baru setiap kategori
  if (indexKategori > 0) {
    pdf.addPage();
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);

  pdf.text(
    `KATEGORI : ${namaKategori.toUpperCase()}`,
    14,
    18
  );

  let currentY = 28;

  const lombaGroup = group[namaKategori];

  const lombaList = Object.keys(lombaGroup).sort();

  lombaList.forEach((namaLomba) => {

    const peserta = lombaGroup[namaLomba];

    /**
     * Jika filter lomba dipilih,
     * skip lomba lain
     */
    if (
      jenisLomba !== "Semua" &&
      namaLomba !== jenisLomba
    ) {
      return;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);

    pdf.text(
      namaLomba,
      14,
      currentY
    );

    autoTable(pdf, {

      startY: currentY + 3,

      head: [[
        "No",
        "Nama Peserta",
        "Alamat",
        "Usia",
        "Status",
      ]],

      body: peserta.map((item, i) => [

        i + 1,

        item.namaPeserta,

        item.alamat,

        item.usia,

        item.status,

      ]),

      theme: "grid",

      styles: {

        fontSize: 9,

        cellPadding: 2,

      },

      headStyles: {

        fillColor: [220, 38, 38],

        textColor: 255,

      },

      margin: {

        left: 14,

        right: 14,

      },

    });

    currentY =
      (pdf as any).lastAutoTable.finalY + 6;

    pdf.setFont("helvetica", "bold");

    pdf.setFontSize(10);

    pdf.text(

      `Jumlah Peserta : ${peserta.length}`,

      14,

      currentY

    );

    currentY += 10;

    /**
     * Jika ruang halaman tinggal sedikit,
     * pindah halaman.
     */

    if (currentY > 255) {

      pdf.addPage();

      currentY = 20;

    }

  });

});
/**
 * =====================================================
 * FOOTER SEMUA HALAMAN
 * =====================================================
 */

const pageCount = pdf.getNumberOfPages();

for (let page = 1; page <= pageCount; page++) {

  pdf.setPage(page);

  pdf.setDrawColor(180);

  pdf.line(
    14,
    287,
    196,
    287
  );

  pdf.setFont("helvetica", "normal");

  pdf.setFontSize(8);

  pdf.text(
    "Portal Bukit Amarilis • RT 07/XIV • HUT RI",
    14,
    292
  );

  pdf.text(
    `Halaman ${page} / ${pageCount}`,
    196,
    292,
    {
      align: "right",
    }
  );

}

/**
 * =====================================================
 * GRAND TOTAL
 * =====================================================
 */

pdf.setPage(pageCount);

const lastY =
  (pdf as any).lastAutoTable
    ? (pdf as any).lastAutoTable.finalY + 10
    : 250;

pdf.setFont("helvetica", "bold");

pdf.setFontSize(11);

pdf.text(

  `GRAND TOTAL PESERTA : ${data.length}`,

  14,

  Math.min(lastY, 280)

);

/**
 * =====================================================
 * SIMPAN PDF
 * =====================================================
 */

const namaFile =

  kategori === "Semua" && jenisLomba === "Semua"

    ? "Daftar-Semua-Peserta.pdf"

    : `Daftar-${kategori}-${jenisLomba}.pdf`;

pdf.save(namaFile);

}