import { NextResponse } from "next/server";

export async function GET() {
  const history = [
    { bulan: "Mei", value: 35360000000 },
    { bulan: "Jun", value: 38080000000 },
    { bulan: "Jul", value: 39520000000 },
    { bulan: "Agu", value: 41760000000 },
    { bulan: "Sep", value: 44160000000 },
    { bulan: "Okt", value: 45440000000 },
  ];

  const prediction = {
    bulan: "Nov",
    value: 47123200000,
  };

  return NextResponse.json({
    history,
    prediction,
    mape: 8.7,
  });
}