import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_APPSCRIPT_API;

export async function GET(req: NextRequest) {
  if (!API_URL) {
    return NextResponse.json(
      {
        success: false,
        message: "NEXT_APPSCRIPT_API belum dikonfigurasi",
      },
      {
        status: 500,
      }
    );
  }

  const { searchParams } = new URL(req.url);


  const action = searchParams.get("action");
  if (
    action !== "getFinanceData" &&
    action !== "getFinanceDashboard" &&
    action !== "getFinanceDetail" &&
    action !== "getCoaCategories" &&
    action !== "getKeuanganList" && 
    action !== "getFinanceDashboardadmin" && 
    action !== "getFinanceSummary"
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Action tidak valid",
      },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 20000);

    // Ambil parameter accType (toleran terhadap variasi case)
      // Di dalam export async function GET(request: Request)
      const bulan = searchParams.get("bulan");
      const tahun = searchParams.get("tahun");
      const accType = searchParams.get("accType") || searchParams.get("acctype");
      
      // Susun URL dengan meneruskan bulan, tahun, dan accType jika tersedia
      let url = `${API_URL}?action=${encodeURIComponent(action)}`;
      if (bulan) {
        url += `&bulan=${encodeURIComponent(bulan)}`;
      }
      if (tahun) {
        url += `&tahun=${encodeURIComponent(tahun)}`;
      }
      if (accType) {
        url += `&accType=${encodeURIComponent(accType)}&acctype=${encodeURIComponent(accType)}`;
      }

    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `Apps Script HTTP ${res.status}`,
        },
        {
          status: 502,
        }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Apps Script tidak mengirim response",
        },
        {
          status: 502,
        }
      );
    }

    try {
      const data = JSON.parse(text);

      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Response Apps Script bukan JSON",
        },
        {
          status: 502,
        }
      );
    }
  } catch (error) {
    console.error("Finance API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Tidak dapat terhubung ke server data.",
      },
      {
        status: 504,
      }
    );
  }
}