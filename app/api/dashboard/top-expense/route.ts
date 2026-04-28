// Mock API for top 5 expenses
import { NextResponse } from "next/server";

export async function GET() {
  // Mocked top 5 expenses
  return NextResponse.json({
    items: [
      { label: "Perawatan", value: 100 },
      { label: "Bahan Bakar", value: 78 },
      { label: "Sewa Kantor", value: 64 },
      { label: "Asuransi", value: 48 },
      { label: "Lain-lain", value: 39 }
    ]
  });
}
