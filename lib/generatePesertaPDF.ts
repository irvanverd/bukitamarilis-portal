import jsPDF from "jspdf";
import QRCode from "qrcode";

export interface PesertaPDF {
  idPeserta: string;
  namaPeserta: string;
  alamat: string;
  kategori: string;
  lomba: string[];
}

export async function generatePesertaPDF(
  peserta: PesertaPDF
) {

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a6",
  });

  const W = 148;
  const H = 160;

  // ===========================================
  // QR CODE
  // ===========================================

  const qrValue = `
Nomor : ${peserta.idPeserta}
Nama : ${peserta.namaPeserta}
Kategori : ${peserta.kategori}
Alamat : ${peserta.alamat}

Lomba :
${peserta.lomba.join("\n")}
`;

  const qr = await QRCode.toDataURL(qrValue, {
    width: 300,
    margin: 1,
  });

  // ===========================================
  // BACKGROUND
  // ===========================================

  pdf.setFillColor(250, 250, 250);
  pdf.rect(0, 0, W, H, "F");

  // ===========================================
  // HEADER
  // ===========================================

  pdf.setFillColor(220, 38, 38);
  pdf.rect(0, 0, W, 18, "F");

  pdf.setTextColor(255);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);

  pdf.text("HUT RI 81", 8, 11);

  pdf.setFontSize(11);

  pdf.text(
    "RT 07/XIV BUKIT AMARILIS",
    45,
    11
  );

  // ===========================================
  // TITLE
  // ===========================================

  pdf.setTextColor(0);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);

  pdf.text(
    "BUKTI PENDAFTARAN LOMBA",
    8,
    26
  );

  // ===========================================
  // DATA PESERTA
  // ===========================================

  pdf.setDrawColor(220);

  pdf.roundedRect(8, 29, 88, 44, 2, 2);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  pdf.text(
    "Nomor Peserta",
    12,
    32
  );

  pdf.setTextColor(220, 38, 38);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);

  pdf.text(
    peserta.idPeserta,
    12,
    43
  );

  pdf.setTextColor(0);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  pdf.text(
    `Nama      : ${peserta.namaPeserta}`,
    12,
    52
  );

  pdf.text(
    `Alamat    : ${peserta.alamat}`,
    12,
    58
  );

  pdf.text(
    `Kategori  : ${peserta.kategori}`,
    12,
    64
  );

  // ===========================================
  // QR CODE
  // ===========================================

  pdf.addImage(
    qr,
    "PNG",
    108,
    34,
    30,
    30
  );

  pdf.setFontSize(8);
  pdf.setTextColor(100);

  pdf.text(
    "Scan saat registrasi ulang",
    103,
    69
  );

  // ===========================================
  // LOMBA YANG DIIKUTI
  // ===========================================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(220, 38, 38);

  const boxY = 74;
  const titleHeight = 8;

  const half = Math.ceil(
    peserta.lomba.length / 2
  );

  const leftItems = peserta.lomba.slice(0, half);
  const rightItems = peserta.lomba.slice(half);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);

  const leftX = 12;
  const rightX = 74;

  const maxWidth = 54;

  let leftY = boxY + 12;
  let rightY = boxY + 12;
    // Hitung tinggi kolom kiri

    leftItems.forEach((item) => {

        const lines = pdf.splitTextToSize(
          "• " + item,
          maxWidth
        );
    
        pdf.text(lines, leftX, leftY);
    
        leftY += lines.length * 4.2 + 2;
    
      });
    
      // Hitung tinggi kolom kanan
    
      rightItems.forEach((item) => {
    
        const lines = pdf.splitTextToSize(
          "• " + item,
          maxWidth
        );
    
        pdf.text(lines, rightX, rightY);
    
        rightY += lines.length * 4.2 + 2;
    
      });
    
      // Tinggi Box
    
      const contentHeight =
        Math.max(leftY, rightY) - (boxY + 12);
    
      const boxHeight = Math.max(
        18,
        contentHeight + titleHeight + 4
      );
    
      // Box
    
      pdf.setDrawColor(220);
    
      pdf.roundedRect(
        8,
        boxY,
        132,
        boxHeight,
        2,
        2
      );
    
      // Judul
    
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
    
      pdf.setTextColor(220, 38, 38);
    
      pdf.text(
        "LOMBA YANG DIIKUTI",
        12,
        boxY + 6
      );
    
      // Isi
    
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
    
      pdf.setTextColor(0);
    
      leftY = boxY + 12;
      rightY = boxY + 12;
    
      leftItems.forEach((item) => {
    
        const lines = pdf.splitTextToSize(
          "• " + item,
          maxWidth
        );
    
        pdf.text(lines, leftX, leftY);
    
        leftY += lines.length * 4.2 + 2;
    
      });
    
      rightItems.forEach((item) => {
    
        const lines = pdf.splitTextToSize(
          "• " + item,
          maxWidth
        );
    
        pdf.text(lines, rightX, rightY);
    
        rightY += lines.length * 4.2 + 2;
    
      });
    
      // ===========================================
      // FOOTER
      // ===========================================
    
      pdf.setFont("helvetica", "normal");
    
      pdf.setFontSize(7);
    
      pdf.setTextColor(120);
    
      pdf.text(
        "Bukit Amarilis • Perumahan Citra Indah City • Bogor",
        W / 2,
        boxY + boxHeight + 5,
        {
          align: "center",
        }
      );
    
      // ===========================================
      // SAVE
      // ===========================================
    
      pdf.save(
        `Bukti-${peserta.idPeserta}.pdf`
      );
    
    }