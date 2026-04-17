"use client";

import dynamic from "next/dynamic";
const DashboardLineChart = dynamic(() => import("./DashboardLineChart"), { ssr: false });
const DashboardKpiCards = dynamic(() => import("./DashboardKpiCards"), { ssr: false });
const DashboardProfitAreaChart = dynamic(() => import("./DashboardProfitAreaChart"), { ssr: false });
const DashboardTopExpense = dynamic(() => import("./DashboardTopExpense"), { ssr: false });
import useSidebarCollapse from "./useSidebarCollapse";
import "../../slicing/dashboard.css";

export default function DashboardPage() {
  useSidebarCollapse();
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">F</div>
          <div className="brand-meta">
            <p className="brand-title">RENTAL FINANCE CONTROL</p>
            <p className="brand-sub">Sistem Manajemen Rental Mobil</p>
          </div>
        </div>
        <button className="sidebar-toggle" type="button" aria-label="Tampilkan atau sembunyikan sidebar" aria-expanded="true">‹</button>
        <nav className="nav">
          <a href="/dashboard" className="nav-link active"><span className="nav-icon">▦</span><span className="nav-text">Dasbor</span></a>
          <a href="/transactions" className="nav-link"><span className="nav-icon">↹</span><span className="nav-text">Transaksi</span></a>
          <a href="/reports" className="nav-link"><span className="nav-icon">▤</span><span className="nav-text">Laporan</span></a>
          <a href="/prediction" className="nav-link"><span className="nav-icon">◔</span><span className="nav-text">Prediksi</span></a>
        </nav>
        <div className="sidebar-foot">
          <p className="user-name">Akbar Palekori</p>
          <p className="user-role">Pemilik</p>
        </div>
      </aside>
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
