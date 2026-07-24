import type { PesertaPDF } from "./generatePesertaPDF";

function getKategoriColor(kategori: string) {

  switch (kategori.toLowerCase()) {

    case "anak":
    case "anak-anak":
      return {
        r: 220,
        g: 38,
        b: 38,
      };

    case "remaja":
      return {
        r: 37,
        g: 99,
        b: 235,
      };

    case "bapak/ibu":
    case "dewasa":
      return {
        r: 147,
        g: 51,
        b: 234,
      };

    case "umum":
      return {
        r: 220,
        g: 38,
        b: 38,
      };

    default:
      return {
        r: 75,
        g: 85,
        b: 99,
      };

  }

}


export function printPeserta(peserta: PesertaPDF) {
  const win = window.open("", "_blank");
  const color = getKategoriColor(peserta.kategori);

const bg =
`rgb(${color.r},${color.g},${color.b})`;

  if (!win) return;

  win.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Kartu Peserta</title>

<style>

*{
box-sizing:border-box;
font-family:Arial,Helvetica,sans-serif;
}

body{
margin:0;
padding:25px;
background:#eee;
}

.card{

width:760px;

margin:auto;

background:#fff;

border:2px solid #d1d5db;

border-radius:12px;

overflow:hidden;

}

.header{

background:${bg};

color:#fff;

padding:18px 24px;

}

.header h1{

margin:0;

font-size:24px;

}

.header p{

margin-top:6px;

font-size:14px;

opacity:.9;

}

.content{

display:flex;

justify-content:space-between;

gap:25px;

padding:24px;

}

.left{

flex:1;

}

.right{

width:250px;

text-align:center;

}

.item{

margin-bottom:14px;

}

.label{

font-size:13px;

color:#777;

}

.value{

font-size:18px;

font-weight:bold;

margin-top:2px;

}

.lomba{

margin-top:20px;

border-top:1px solid #ddd;

padding-top:15px;

}

.lomba h3{

margin:0 0 10px;

color:#dc2626;

}

.lomba ul{

padding-left:18px;

margin:0;

}

.lomba li{

margin-bottom:6px;

font-size:15px;

}

.footer{

padding:14px;

text-align:center;

font-size:12px;

color:#666;

border-top:1px solid #ddd;

}

@media print{

body{

background:white;

padding:0;

}

.card{

width:100%;

border:none;

box-shadow:none;

}

}

</style>

</head>

<body>

<div class="card">

<div class="header">

<h1>BUKTI PENDAFTARAN LOMBA</h1>

<p>RT 07/XIV Bukit Amarilis</p>

</div>

<div class="content">

<div class="left">

<div class="item">

<div class="label">Nomor Peserta</div>

<div class="value">${peserta.idPeserta}</div>

</div>

<div class="item">

<div class="label">Nama Peserta</div>

<div class="value">${peserta.namaPeserta}</div>

</div>

<div class="item">

<div class="label">Alamat</div>

<div class="value">${peserta.alamat}</div>

</div>

<div class="item">

<div class="label">Kategori</div>

<div class="value">${peserta.kategori}</div>

</div>

</div>

<div class="right">

<img
src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    peserta.idPeserta
  )}"
width="170"
/>

<div style="margin-top:10px;font-size:13px">
Scan saat registrasi ulang
</div>

</div>

</div>

<div class="lomba">

<h3>Lomba yang Diikuti</h3>

<ul>

${peserta.lomba
  .map((x) => `<li>${x}</li>`)
  .join("")}

</ul>

</div>

<div class="footer">

RT 07 / XIV Bukit Amarilis © 2026

</div>

</div>

<script>

window.onload=function(){

window.print();

setTimeout(()=>window.close(),300);

}

</script>

</body>

</html>
`);

  win.document.close();
}