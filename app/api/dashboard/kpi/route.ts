// Mock API for KPI cards
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    kpis: [
      {
        label: "TOTAL PENDAPATAN",
        value: "Rp45.440.000.000",
        trend: "+12,5% dibanding bulan lalu",
        trendType: "up"
      },
      {
        label: "TOTAL PENGELUARAN",
        value: "Rp17.920.000.000",
        trend: "+4,2% dibanding bulan lalu",
        trendType: "down"
      },
      {
        label: "LABA BERSIH",
        value: "Rp27.520.000.000",
        trend: "+18,1% dibanding bulan lalu",
        trendType: "up",
        dark: true
      }
    ]
  });
}
