// Mock API for area chart (Akumulasi Laba YTD)
import { NextResponse } from "next/server";

export async function GET() {
  // Mocked YTD profit data
  return NextResponse.json({
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu"],
    profit: [0, 20, 38, 56, 78, 100, 120, 130]
  });
}
