"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "./reports.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ReportsPage() {
  // ===== STATE =====
  const [frequency, setFrequency] = useState("bulanan");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ===== FORMAT =====
  const formatCurrency = (val: number) =>
    `Rp ${val.toLocaleString("id-ID")}`;

  // ===== FETCH API =====
  const fetchReports = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      frequency,
      startDate,
      endDate,
    });

    const res = await fetch(`/api/reports?${params}`);
    const result = await res.json();

    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [frequency, startDate, endDate]);

  // ===== EXPORT PDF =====
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Laporan Keuangan", 14, 15);

    doc.setFontSize(10);
    doc.text(
      `Periode: ${startDate || "-"} s/d ${endDate || "-"}`,
      14,
      22
    );

    autoTable(doc, {
      startY: 30,
      head: [["Tanggal", "Deskripsi", "Kategori", "Nominal"]],
      body: (data?.transactions || []).map((item: any) => [
        item.date,
        item.desc,
        item.cat,
        `${item.cat === "Pengeluaran" ? "-" : "+"} Rp ${item.amount.toLocaleString("id-ID")}`,
      ]),
    });

    doc.save("laporan.pdf");
  };

  // ===== EXPORT EXCEL =====
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data?.transactions || []);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Laporan");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([buffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "laporan.xlsx");
  };

  return (
    <div className="dashboard-shell">
      <Sidebar active="reports" />

      <main className="main-area">
        {/* HEADER */}
        <header className="topbar">
          <div>
            <p className="eyebrow">INTELIJEN KEUANGAN</p>
            <h1>Laporan Institusional</h1>
            <p className="subtitle">Atur periode laporan, lalu unduh hasilnya dalam format PDF & Export Excel</p>
          </div>

          <div className="head-actions">
            <button className="btn-primary" onClick={exportPDF}>
              Unduh PDF
            </button>
            <button className="btn-primary" onClick={exportExcel}>
              Export Excel
            </button>
          </div>
        </header>
        

        <div className="report-layout">
          {/* LEFT */}
          <aside className="config-panel">
            <h3>Konfigurasi Laporan</h3>

            <p>Frekuensi</p>
            <button onClick={() => setFrequency("harian")} className={`option ${frequency === "harian" ? "active" : ""}`}>Laporan Harian</button>
            <button onClick={() => setFrequency("mingguan")} className={`option ${frequency === "mingguan" ? "active" : ""}`}>Laporan Mingguan</button>
            <button onClick={() => setFrequency("bulanan")} className={`option ${frequency === "bulanan" ? "active" : ""}`}>Laporan Bulanan</button>

            <p>Tanggal Mulai</p>
            <input 
              type="date" 
              placeholder="dd/mm/yyyy"
              onChange={(e) => setStartDate(e.target.value)} 
              value={startDate}
            />

            <p>Tanggal Selesai</p>
            <input 
              type="date" 
              placeholder="dd/mm/yyyy"
              onChange={(e) => setEndDate(e.target.value)} 
              value={endDate}
            />
          </aside>

          {/* RIGHT */}
          <section className="report-content">
            <p>Rental Finance Control</p>
            <h2>LAPORAN BULANAN</h2>
            <p>1 OKTOBER - 31 OKTOBER 2026</p>

            {/* SUMMARY */}
            <div className="summary-grid">
              <div className="card">
                <p>Total Pendapatan</p>
                <h3>{formatCurrency(data?.summary?.totalIncome || 0)}</h3>
              </div>

              <div className="card">
                <p>Pengeluaran</p>
                <h3>{formatCurrency(data?.summary?.totalExpense || 0)}</h3>
              </div>

              <div className="card highlight">
                <p>Laba Bersih</p>
                <h3>{formatCurrency(data?.summary?.netProfit || 0)}</h3>
              </div>
            </div>

            {/* CHART */}
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data?.chart || []}>
                  <defs>
                    <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />

                  <Area dataKey="pendapatan" fill="url(#colorA)" stroke="none" />
                  <Line dataKey="pendapatan" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  <Line dataKey="tren" stroke="#22c55e" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* TABLE */}
            <h3 className="report-table"><b>Daftar Transaksi (Entri Utama)</b></h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Deskripsi</th>
                  <th>Kategori</th>
                  <th>Nominal</th>
                </tr>
              </thead>
              <tbody>
                {(data?.transactions || []).map((item: any, i: number) => (
                  <tr key={i}>
                    <td>{item.date}</td>
                    <td>{item.desc}</td>
                    <td>
                      <span className={`badge ${item.cat === "Pendapatan" ? "green" : "red"}`}>
                        {item.cat}
                      </span>
                    </td>
                    <td>
                      {item.cat === "Pengeluaran" ? "-" : "+"} {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && <p>Loading...</p>}
          </section>
        </div>
      </main>
    </div>
  );
}