import { NextResponse } from "next/server";
import { getFinanceData } from "@/lib/googleSheet";

export async function GET() {
  try {
    const data = await getFinanceData();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load finance data" },
      { status: 500 }
    );
  }
}