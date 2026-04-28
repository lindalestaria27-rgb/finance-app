

"use client";

import dynamic from "next/dynamic";
const DashboardLineChart = dynamic(() => import("./DashboardLineChart"), { ssr: false });
const DashboardKpiCards = dynamic(() => import("./DashboardKpiCards"), { ssr: false });
const DashboardProfitAreaChart = dynamic(() => import("./DashboardProfitAreaChart"), { ssr: false });
const DashboardTopExpense = dynamic(() => import("./DashboardTopExpense"), { ssr: false });
import Sidebar from "../components/Sidebar";


export default function DashboardPage() {
  return (
    <div className="dashboard-shell">
      <Sidebar active="dashboard" />
      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Intelijen Keuangan</p>
            <h1>Ringkasan Dasbor</h1>
          </div>
          <div className="topbar-actions">
            <a className="btn-report" href="/reports">Buka Laporan</a>
          </div>
        </header>
        {/* KPI Cards from API */}
        <DashboardKpiCards />
        <section className="content-grid">
          <article className="panel line-chart-panel">
            <div className="panel-head">
              <div>
                <h3>Pendapatan vs Pengeluaran</h3>
                <p>Perbandingan kinerja bulanan</p>
              </div>
              <div className="legend">
                <span><i className="dot income"></i>Pendapatan</span>
                <span><i className="dot expense"></i>Pengeluaran</span>
              </div>
            </div>
            <div className="line-chart">
              <DashboardLineChart />
            </div>
          </article>
          <article className="panel area-panel">
            <h3>Akumulasi Laba (YTD)</h3>
            <p>Grafik area sejak awal tahun</p>
            <div className="area-chart">
              <DashboardProfitAreaChart />
            </div>
          </article>
          <article className="panel hbar-panel">
            <h3>5 Pengeluaran Tertinggi</h3>
            <p>Pengeluaran terbesar bulan ini</p>
            <DashboardTopExpense />
          </article>
        </section>
      </main>
    </div>
  );
}
