import { NextResponse } from "next/server";

// ===== MOCK DATA =====
const reportData = [
  { date: "2026-10-24", desc: "Global Securities Inc.", cat: "Pendapatan", amount: 227200000 },
  { date: "2026-10-24", desc: "Sewa Kantor Medicon Ave", cat: "Pengeluaran", amount: 152000000 },
  { date: "2026-10-22", desc: "Langganan Cloud SAAS", cat: "Pengeluaran", amount: 51040000 },
];

// ===== FILTER FUNCTION =====
function filterData(data: any[], frequency: string, startDate?: string, endDate?: string) {
  return data.filter((item) => {
    const d = new Date(item.date);
    const now = new Date();

    if (startDate && d < new Date(startDate)) return false;
    if (endDate && d > new Date(endDate)) return false;

    if (frequency === "harian") {
      return d.toDateString() === now.toDateString();
    }

    if (frequency === "mingguan") {
      const firstDay = new Date(now);
      firstDay.setDate(now.getDate() - now.getDay());
      return d >= firstDay;
    }

    if (frequency === "bulanan") {
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }

    return true;
  });
}

// ===== CHART DUMMY =====
function generateChart() {
  return [
    { name: "Mei", pendapatan: 400, tren: 420 },
    { name: "Jun", pendapatan: 600, tren: 580 },
    { name: "Jul", pendapatan: 550, tren: 530 },
    { name: "Agu", pendapatan: 800, tren: 780 },
    { name: "Sep", pendapatan: 700, tren: 690 },
    { name: "Okt", pendapatan: 650, tren: 640 },
  ];
}

// ===== API GET =====
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const frequency = searchParams.get("frequency") || "bulanan";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const filtered = filterData(reportData, frequency, startDate, endDate);

  // ===== SUMMARY =====
  const totalIncome = filtered
    .filter((d) => d.cat === "Pendapatan")
    .reduce((acc, d) => acc + d.amount, 0);

  const totalExpense = filtered
    .filter((d) => d.cat === "Pengeluaran")
    .reduce((acc, d) => acc + d.amount, 0);

  const netProfit = totalIncome - totalExpense;

  return NextResponse.json({
    summary: {
      totalIncome,
      totalExpense,
      netProfit,
    },
    chart: generateChart(),
    transactions: filtered,
  });
}