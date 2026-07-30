import jsPDF from "jspdf";
import QRCode from "qrcode";
import type { Peserta } from "@/types/lomba";

async function imageToBase64(path:string){

    const res = await fetch(path);
  
    const blob = await res.blob();
  
    return await new Promise<string>((resolve)=>{
  
        const reader = new FileReader();
  
        reader.onloadend=()=>{
  
            resolve(reader.result as string);
  
        }
  
        reader.readAsDataURL(blob);
  
    });
  
  }

function getKategoriColor(kategori: string) {

  switch ((kategori || "").toLowerCase()) {

    case "anak":
    case "anak-anak":
      return { r: 220, g: 38, b: 38 };

    case "remaja":
      return { r: 37, g: 99, b: 235 };

    case "bapak/ibu":
    case "dewasa":
      return { r: 147, g: 51, b: 234 };

    case "umum":
      return { r: 22, g: 163, b: 74 };

    default:
      return { r: 220, g: 38, b: 38 };

  }

}

async function getKategoriLogo(kategori: string) {

    switch (kategori.trim().toLowerCase()) {
  
      case "anak":
      case "anak-anak":
        return await imageToBase64("/assets/hut-ri-81-white.png");
  
  
      default:
        return await imageToBase64("/assets/hut-ri-81-red.png");
    }
  
  }
const SCALE = 1.08;
const CARD_W = 95;
const CARD_H = 84 * SCALE;

const GAP_X = 6 * SCALE;
const GAP_Y = 5 * SCALE;

const MARGIN_X = 8 * SCALE;

const MARGIN_Y = 8 * SCALE;

function getCardPosition(index: number) {

  const col = index % 2;

  const row = Math.floor(index / 2);

  return {

    x: MARGIN_X + (CARD_W + GAP_X) * col,

    y: MARGIN_Y + (CARD_H + GAP_Y) * row,

  };

}

async function drawCard(

  pdf: jsPDF,

  peserta: Peserta,

  startX: number,

  startY: number

) {

  const color = getKategoriColor(peserta.kategori);
  const logoHUT =  await getKategoriLogo(peserta.kategori);
  const logoRT = await imageToBase64("/assets/logo-rt.png");
  const lomba: string[] = Array.isArray((peserta as any).lomba)
  ? (peserta as any).lomba
  : String(
      (peserta as any).jenisLomba ??
      (peserta as any).lomba ??
      ""
    )
      .split(",")
      .map((x: string) => x.trim())
      .filter(Boolean);

  const qrValue = `

Nomor : ${peserta.idPeserta}

Nama : ${peserta.namaPeserta}

Kategori : ${peserta.kategori}

Alamat : ${peserta.alamat}

Lomba :

${lomba.join("\n")}

`;

  const qr = await QRCode.toDataURL(qrValue, {

    width: 250,

    margin: 1,

  });

  // ===========================================================
  // CARD
  // ===========================================================

  pdf.setFillColor(250,250,250);

  pdf.roundedRect(

      startX,

      startY,

      CARD_W,

      CARD_H,

      2,

      2,

      "F"

  );

  pdf.setDrawColor(220);

  pdf.roundedRect(

      startX,

      startY,

      CARD_W,

      CARD_H,

      2,

      2

  );

  // ===========================================================
  // HEADER
  // ===========================================================

  pdf.setFillColor(

      color.r,

      color.g,

      color.b

  );

  pdf.rect(

      startX,

      startY,

      CARD_W,

      13,

      "F"

  );

  pdf.addImage(

      logoRT,

      "PNG",

      startX+2,

      startY+2,

      9,

      9

  );

  pdf.addImage(

      logoHUT,

      "PNG",

      startX+CARD_W-10,

      startY+2,

      9,

      9

  );

  pdf.setTextColor(255);

  pdf.setFont("helvetica","bold");

  pdf.setFontSize(11);

  pdf.text(

      "HUT RI 81",

      startX+CARD_W/2,

      startY+5,

      {

          align:"center"

      }

  );

  pdf.setFontSize(10);

  pdf.text(

      "RT 07/XIV Bukit Amarilis",

      startX+CARD_W/2,

      startY+9,

      {

          align:"center"

      }

  );
    // ===========================================================
  // TITLE
  // ===========================================================

  pdf.setTextColor(0);

  pdf.setFont("helvetica", "bold");

  pdf.setFontSize(8);

  pdf.text(

    "BUKTI PENDAFTARAN",

    startX + 3,

    startY + 18

  );

  // ===========================================================
  // DATA PESERTA
  // ===========================================================

  pdf.setDrawColor(220);

  pdf.roundedRect(

    startX + 3,

    startY + 21,

    56,

    26,

    2,

    2

  );

  pdf.setFont("helvetica", "normal");

  pdf.setFontSize(8);

  pdf.text(

    "Nomor Peserta",

    startX + 6,

    startY + 25

  );

  pdf.setTextColor(

    color.r,

    color.g,

    color.b

  );

  pdf.setFont("helvetica", "bold");

  pdf.setFontSize(13);

  pdf.text(

    peserta.idPeserta,

    startX + 6,

    startY + 30

  );

  pdf.setTextColor(0);

  pdf.setFont("helvetica", "normal");

  pdf.setFontSize(8);

  const nama = pdf.splitTextToSize(

    peserta.namaPeserta,

    44

  );

  pdf.text(

    `Nama : ${peserta.namaPeserta}`,

    startX + 6,

    startY + 35

  );

  const alamat = pdf.splitTextToSize(

    peserta.alamat,

    42

  );

  pdf.text(

    `Alamat : ${peserta.alamat}`,

    startX + 6,

    startY + 40

  );

  pdf.text(

    `Kategori : ${peserta.kategori}`,

    startX + 6,

    startY + 45

  );

  // ===========================================================
  // QR CODE
  // ===========================================================

  pdf.addImage(

    qr,

    "PNG",

    startX + 64,

    startY + 22,

    24,

    24

  );

  pdf.setFontSize(4.5);

  pdf.setTextColor(120);

  pdf.text(

    "",

    startX + 67,

    startY + 48

  );

  pdf.text(

    "",

    startX + 64,

    startY + 51

  );

  // ===========================================================
  // LOMBA BOX
  // ===========================================================

  const boxY = startY + 53;

  pdf.setDrawColor(220);

  pdf.roundedRect(

    startX + 3,

    boxY,

    89,

    30,

    2,

    2

  );

  pdf.setFont(

    "helvetica",

    "bold"

  );

  pdf.setFontSize(10);

  pdf.setTextColor(

    color.r,

    color.g,

    color.b

  );

  pdf.text(

    "LOMBA YANG DIIKUTI",

    startX + 6,

    boxY + 5

  );

  pdf.setFont(

    "helvetica",

    "normal"

  );

  pdf.setFontSize(8);

  pdf.setTextColor(0);

    const half = Math.ceil(lomba.length / 2);
    const leftItems = lomba.slice(0, half);
    const rightItems = lomba.slice(half);

  let leftY = boxY + 9;

  let rightY = boxY + 9;

  const maxWidth = 34;

  leftItems.forEach((item) => {

    const lines = pdf.splitTextToSize(

      "• " + item,

      maxWidth

    );

    pdf.text(

      lines,

      startX + 6,

      leftY

    );

    leftY += lines.length * 2.8 + 1;

  });

  rightItems.forEach((item) => {

    const lines = pdf.splitTextToSize(

      "• " + item,

      maxWidth

    );

    pdf.text(

      lines,

      startX + 48,

      rightY

    );

    rightY += lines.length * 2.8 + 1;

  });

  // ===========================================================
  // FOOTER
  // ===========================================================

  pdf.setFontSize(4.5);

  pdf.setTextColor(120);

  pdf.text(

    "Karang Taruna Bukit Amarilis • Citra Indah City",

    startX + CARD_W / 2,

    startY + CARD_H - 3,

    {

      align: "center"

    }

  );

}
export async function generateCardPDF(
    pesertaList: Peserta[]
  ) {
  
    if (!pesertaList || pesertaList.length === 0) {
  
      alert("Tidak ada data peserta.");
  
      return;
  
    }
  
    const pdf = new jsPDF({
  
      orientation: "portrait",
  
      unit: "mm",
  
      format: "a4",
  
      compress: true,
  
    });
  
    for (let i = 0; i < pesertaList.length; i++) {
  
      // setiap 6 kartu pindah halaman
      if (i > 0 && i % 6 === 0) {
  
        pdf.addPage();
  
      }
  
      const pos = getCardPosition(i % 6);
  
      await drawCard(
  
        pdf,
  
        pesertaList[i],
  
        pos.x,
  
        pos.y
  
      );
  
    }
  
    // =====================================================
    // INFO FILE
    // =====================================================
  
    pdf.setProperties({
  
      title: "Kartu Peserta",
  
      subject: "Pendaftaran Lomba",
  
      author: "RT 07/XIV Bukit Amarilis",
  
      creator: "Portal Bukit Amarilis",
  
    });
  
    pdf.save(
  
      `Kartu-Peserta-${new Date()
  
        .toISOString()
  
        .substring(0,10)}.pdf`
  
    );
  
  }

  /**
 * ===========================================================
 * HELPER
 * ===========================================================
 */

function safeText(value: any) {
    if (value === null || value === undefined) return "";
    return String(value);
  }
  
  function splitLomba(pdf: jsPDF, text: string, width: number) {
    return pdf.splitTextToSize(
      safeText(text),
      width
    );
  }
  
  /**
   * ===========================================================
   * EXPORT DEFAULT
   * ===========================================================
   */
  
  export default generateCardPDF;