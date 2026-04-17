// Mock API for dashboard chart data
import { NextResponse } from "next/server";

export async function GET() {
  // Mocked monthly data for income and expense
  return NextResponse.json({
    income: [210, 198, 202, 180, 190, 162, 168, 142],
    expense: [190, 172, 178, 156, 164, 144, 154, 132],
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu"]
  });
}
