export async function getFinanceData() {
    const SHEET_ID = process.env.SHEET_CHARTFIN_ID;
  
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