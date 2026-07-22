"use client";

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
 * Group berdasarkan
 * Kategori -> Jenis Lomba
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
 * Print Daftar Peserta
 */
export function printList(
  data: PesertaList[],
  kategori: string,
  jenisLomba: string
) {

  const win = window.open("", "_blank");

  if (!win) return;

  const today = new Date().toLocaleString("id-ID");

  let html = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8"/>

<title>Daftar Peserta</title>

<style>

body{

    font-family:Arial,Helvetica,sans-serif;
    margin:20px;
    color:#222;

}

h1{

    text-align:center;
    margin:0;

}

h2{

    margin-top:28px;
    margin-bottom:8px;
    color:#dc2626;

}

h3{

    margin-top:20px;
    margin-bottom:6px;

}

.info{

    margin-top:18px;
    margin-bottom:20px;
    font-size:14px;

}

table{

    width:100%;
    border-collapse:collapse;
    margin-bottom:18px;

}

th{

    background:#dc2626;
    color:white;
    border:1px solid #ccc;
    padding:7px;

}

td{

    border:1px solid #ccc;
    padding:7px;
    font-size:13px;

}

.center{

    text-align:center;

}

.right{

    text-align:right;

}

.footer{

    margin-top:30px;
    font-size:12px;
    color:#666;
    text-align:right;

}

.page{

    page-break-after:always;

}

@media print{

    body{

        margin:10mm;

    }

    .no-print{

        display:none;

    }

}

</style>

</head>

<body>

<h1>DAFTAR PESERTA LOMBA</h1>

<div class="info">

<b>Kategori :</b> ${kategori}
<br>

<b>Jenis Lomba :</b> ${jenisLomba}
<br>

<b>Total Peserta :</b> ${data.length}
<br>

<b>Dicetak :</b> ${today}

</div>
`;
const group = buildGroup(data);
/**
 * ===========================================================
 * TAMPILAN BIASA (BUKAN GROUPING)
 * ===========================================================
 */

if (kategori !== "Semua" && jenisLomba !== "Semua") {

    html += `
  <table>
  
  <thead>
  <tr>
  <th width="50">No</th>
  <th>Nama Peserta</th>
  <th>Alamat</th>
  <th width="70">Usia</th>
  <th width="90">Status</th>
  <th width="70">Hadir</th>
  </tr>
  </thead>
  
  <tbody>
  `;
  
    data.forEach((item, index) => {
  
      html += `
  <tr>
  
  <td class="center">${index + 1}</td>
  
  <td>${item.namaPeserta}</td>
  
  <td>${item.alamat}</td>
  
  <td class="center">${item.usia}</td>
  
  <td class="center">${item.status}</td>
  
  <td></td>
  
  </tr>
  `;
  
    });
  
    html += `
  </tbody>
  
  </table>
  `;
  
  } else {
  
    /**
     * ===========================================================
     * GROUP KATEGORI → LOMBA
     * ===========================================================
     */
  
    Object.keys(group)
      .sort()
      .forEach((namaKategori) => {
  
        html += `
  <h2>${namaKategori}</h2>
  `;
  
        const lombaGroup = group[namaKategori];
  
        Object.keys(lombaGroup)
          .sort()
          .forEach((namaLomba) => {
  
            if (
              jenisLomba !== "Semua" &&
              namaLomba !== jenisLomba
            ) {
              return;
            }
  
            const peserta = lombaGroup[namaLomba];
  
            html += `
  <h3>${namaLomba}</h3>
  
  <table>
  
  <thead>
  
  <tr>
  
  <th width="50">No</th>
  
  <th>Nama Peserta</th>
  
  <th>Alamat</th>
  
  <th width="70">Usia</th>
  
  <th width="90">Status</th>
  
  <th width="70">Hadir</th>
  
  </tr>
  
  </thead>
  
  <tbody>
  `;
  
            peserta.forEach((item, index) => {
  
              html += `
  <tr>
  
  <td class="center">${index + 1}</td>
  
  <td>${item.namaPeserta}</td>
  
  <td>${item.alamat}</td>
  
  <td class="center">${item.usia}</td>
  
  <td class="center">${item.status}</td>
  
  <td></td>
  
  </tr>
  `;
  
            });
  
            html += `
  </tbody>
  
  <tfoot>
  
  <tr>
  
  <td colspan="6" class="right">
  
  <b>Jumlah Peserta :
  ${peserta.length}</b>
  
  </td>
  
  </tr>
  
  </tfoot>
  
  </table>
  `;
  
          });
  
        html += `
  <div class="page"></div>
  `;
  
      });
  
  }
  
  /**
   * ===========================================================
   * FOOTER
   * ===========================================================
   */
  
  html += `
  <div class="footer">
  
  Portal Bukit Amarilis<br>
  
  Dicetak :
  ${today}
  
  </div>
  
  <script>
  
  window.onload = function(){
  
      window.print();
  
      setTimeout(function(){
  
          window.close();
  
      },300);
  
  }
  
  </script>
  
  </body>
  
  </html>
  `;
  
    win.document.open();
  
    win.document.write(html);
  
    win.document.close();
  
  }