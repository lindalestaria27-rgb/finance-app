"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "./reports.css";

// Menggunakan ComposedChart untuk gabungan Bar (Batang) dan Line (Garis)
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useAuth } from "../context/AuthContext";

export default function ReportsPage() {
  const { token } = useAuth(); 
  const [frequency, setFrequency] = useState("bulanan");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const MIN_DATE = "2000-01-01";
  const MAX_DATE = "2050-12-31";
  const MIN_MONTH = "2000-01";
  const MAX_MONTH = "2050-12";

  const formatCurrency = (val: number) =>
    `Rp ${val.toLocaleString("id-ID")}`;

  const formatYMD = (date: Date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return ""; 
    const month = "" + (d.getMonth() + 1);
    const day = "" + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, "0"), day.padStart(2, "0")].join("-");
  };

  const getReportTitle = () => {
    const titleMap: Record<string, string> = {
      harian: "LAPORAN HARIAN",
      mingguan: "LAPORAN MINGGUAN",
      bulanan: "LAPORAN BULANAN",
    };
    return titleMap[frequency] || "LAPORAN";
  };

  const formatDateRange = () => {
    if (!startDate || !endDate) return "Memuat periode...";

    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };

    const formattedStart = start.toLocaleDateString("id-ID", options);
    const formattedEnd = end.toLocaleDateString("id-ID", options);

    if (formattedStart === formattedEnd) return formattedStart;
    return `${formattedStart} - ${formattedEnd}`;
  };

  useEffect(() => {
    const today = new Date();

    if (frequency === "harian") {
      const ymd = formatYMD(today);
      setStartDate(ymd);
      setEndDate(ymd);
    } else if (frequency === "mingguan") {
      const day = today.getDay() || 7;
      const monday = new Date(today);
      monday.setDate(monday.getDate() - day + 1);
      
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);

      setStartDate(formatYMD(monday));
      setEndDate(formatYMD(sunday));
    } else if (frequency === "bulanan") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(formatYMD(firstDay));
      setEndDate(formatYMD(lastDay));
    }
  }, [frequency]);

const fetchReports = async () => {
    if (!startDate || !endDate || !token) return;

    setLoading(true);

    let endpoint = "";
    if (frequency === "harian") endpoint = "daily-profit";
    else if (frequency === "mingguan") endpoint = "weekly-profit";
    else if (frequency === "bulanan") endpoint = "monthly-profit";

    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });

    try {
      const authHeader = token.toLowerCase().startsWith("bearer ") 
        ? token 
        : `Bearer ${token}`;

      const res = await fetch(`/api/transactions/analysis/${endpoint}?${params}`, {
        method: "GET",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      if (res.ok && result) {

        const transformedItems = (result.items || []).map((item: any) => {
          const periodLabel = item.week || item.date || item.month || item.period || "N/A";
          return {
            name: periodLabel,
            pendapatan: item.total_income || 0,
            pengeluaran: item.total_expense || 0,
            tren: item.profit || 0,
          };
        });

        setData({
          summary: {
            totalIncome: result.total_income || 0,
            totalExpense: result.total_expense || 0,
            netProfit: result.profit || 0,
          },
          items: transformedItems,
        });
      } else {
        console.error("Gagal mengambil data:", result.server_message || "Unknown error");
      }
    } catch (error) {
      console.error("Error saat fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frequency, startDate, endDate]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Laporan Keuangan", 14, 15);
    doc.setFontSize(10);
    doc.text(`Periode: ${startDate || "-"} s/d ${endDate || "-"}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [["Periode", "Pendapatan", "Pengeluaran", "Laba Bersih"]],
      body: (data?.items || []).map((item: any) => [
        item.name,
        `Rp ${item.pendapatan.toLocaleString("id-ID")}`,
        `Rp ${item.pengeluaran.toLocaleString("id-ID")}`,
        `Rp ${item.tren.toLocaleString("id-ID")}`,
      ]),
    });

    doc.save("laporan_analisis.pdf");
  };

  const exportExcel = () => {
    const exportData = (data?.items || []).map((item: any) => ({
      Periode: item.name,
      Pendapatan: item.pendapatan,
      Pengeluaran: item.pengeluaran,
      "Laba Bersih (Profit)": item.tren,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Analisis Laporan");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const file = new Blob([buffer], { type: "application/octet-stream" });

    saveAs(file, "laporan_analisis.xlsx");
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
            <p className="subtitle">Analisis profitabilitas rentang waktu (Harian/Mingguan/Bulanan)</p>
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
          {/* LEFT: KONFIGURASI PANEL */}
          <aside className="config-panel">
            <h3>Konfigurasi Laporan</h3>

            <p>Frekuensi Analisis</p>
            <button
              onClick={() => setFrequency("harian")}
              className={`option ${frequency === "harian" ? "active" : ""}`}
            >
              Harian (Daily Profit)
            </button>
            <button
              onClick={() => setFrequency("mingguan")}
              className={`option ${frequency === "mingguan" ? "active" : ""}`}
            >
              Mingguan (Weekly Profit)
            </button>
            <button
              onClick={() => setFrequency("bulanan")}
              className={`option ${frequency === "bulanan" ? "active" : ""}`}
            >
              Bulanan (Monthly Profit)
            </button>

            <hr style={{ margin: "1rem 0", borderColor: "#eee" }} />

            {/* INPUT HARIAN */}
            {frequency === "harian" && (
              <>
                <p>Mulai Tanggal</p>
                <input
                  type="date"
                  min={MIN_DATE}
                  max={MAX_DATE}
                  value={startDate}
                  onChange={(e) => {
                    const selectedStart = e.target.value;
                    setStartDate(selectedStart);
                    
                    if (selectedStart) {
                      const startD = new Date(selectedStart);
                      startD.setDate(startD.getDate() + 1); 
                      setEndDate(formatYMD(startD));
                    }
                  }}
                />
                <p>Sampai Tanggal</p>
                <input
                  type="date"
                  min={MIN_DATE}
                  max={MAX_DATE}
                  value={endDate}
                  onChange={(e) => {
                    const selectedEnd = e.target.value;
                    setEndDate(selectedEnd);
                    
                    if (selectedEnd) {
                      const endD = new Date(selectedEnd);
                      endD.setDate(endD.getDate() - 1); 
                      setStartDate(formatYMD(endD));
                    }
                  }}
                />
              </>
            )}

            {/* INPUT MINGGUAN: Snap ke Senin-Minggu */}
            {frequency === "mingguan" && (
              <>
                <p>Pilih Hari (Penentu Minggu Awal)</p>
                <input
                  type="date"
                  min={MIN_DATE}
                  max={MAX_DATE}
                  value={startDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    
                    const selected = new Date(val);
                    const day = selected.getDay() || 7; 
                    
                    const monday = new Date(selected);
                    monday.setDate(monday.getDate() - day + 1);
                    setStartDate(formatYMD(monday));

                    const sunday = new Date(monday);
                    sunday.setDate(sunday.getDate() + 6);
                    setEndDate(formatYMD(sunday));
                  }}
                />
                
                <p>Sampai Akhir Minggu</p>
                <input
                  type="date"
                  min={MIN_DATE}
                  max={MAX_DATE}
                  value={endDate}
                  onChange={(e) => {
                     const val = e.target.value;
                     if (!val) return;
                     
                     const selected = new Date(val);
                     const day = selected.getDay() || 7; 
                     const sunday = new Date(selected);
                     sunday.setDate(sunday.getDate() + (7 - day));
                     setEndDate(formatYMD(sunday));
                  }}
                />
                <small style={{ color: "#666", display: "block", marginTop: "0.5rem", lineHeight: "1.4" }}>
                  Sistem secara otomatis menyesuaikan pencarian dari <b>Senin</b> s/d <b>Minggu</b>.
                </small>
              </>
            )}

            {/* INPUT BULANAN */}
            {frequency === "bulanan" && (
              <>
                <p>Mulai Bulan</p>
                <input
                  type="month"
                  min={MIN_MONTH}
                  max={MAX_MONTH}
                  value={startDate.substring(0, 7)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const [year, month] = val.split("-");
                    const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
                    setStartDate(formatYMD(firstDay));
                  }}
                />
                <p>Sampai Bulan</p>
                <input
                  type="month"
                  min={MIN_MONTH}
                  max={MAX_MONTH}
                  value={endDate.substring(0, 7)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const [year, month] = val.split("-");
                    const lastDay = new Date(parseInt(year), parseInt(month), 0);
                    setEndDate(formatYMD(lastDay));
                  }}
                />
              </>
            )}
          </aside>

          {/* RIGHT: KONTEN LAPORAN */}
          <section className="report-content">
            <p>Rental Finance Analysis</p>
            <h2>{getReportTitle()}</h2>
            <p className="date-range" style={{ color: "#3b82f6", fontWeight: "600" }}>{formatDateRange()}</p>

            {/* SUMMARY CARDS */}
            <div className="summary-grid">
              <div className="card">
                <p>Total Pendapatan</p>
                <h3>{formatCurrency(data?.summary?.totalIncome || 0)}</h3>
              </div>

              <div className="card">
                <p>Total Pengeluaran</p>
                <h3>{formatCurrency(data?.summary?.totalExpense || 0)}</h3>
              </div>

              <div className="card highlight">
                <p>Laba Bersih (Profit)</p>
                <h3>{formatCurrency(data?.summary?.netProfit || 0)}</h3>
              </div>
            </div>

            {/* CHART: BAR + LINE */}
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={data?.items || []} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
                  <XAxis dataKey="name" scale="band" />
                  <YAxis />
                  <Tooltip cursor={{ fill: "rgba(200, 200, 200, 0.2)" }} />
                  <Legend />
                  
                  {/* Diagram Batang */}
                  <Bar dataKey="pendapatan" name="Pendapatan" barSize={30} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pengeluaran" name="Pengeluaran" barSize={30} fill="#ef4444" radius={[4, 4, 0, 0]} />
                  
                  {/* Diagram Garis */}
                  <Line type="monotone" dataKey="tren" name="Tren Profit" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* TABLE SUMMARY */}
            <h3 className="report-table">
              <b>Rincian Laporan Analisis</b>
            </h3>
            {loading ? (
              <p>Sedang memuat analisis dari server...</p>
            ) : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Periode / Waktu</th>
                    <th>Pendapatan</th>
                    <th>Pengeluaran</th>
                    <th>Laba Bersih (Profit)</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items && data.items.length > 0 ? (
                    data.items.map((item: any, i: number) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td style={{ color: "#3b82f6" }}>+ {formatCurrency(item.pendapatan)}</td>
                        <td style={{ color: "#ef4444" }}>- {formatCurrency(item.pengeluaran)}</td>
                        <td>
                          <span className={`badge ${item.tren >= 0 ? "green" : "red"}`}>
                            {formatCurrency(item.tren)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", color: "#666" }}>
                        Tidak ada data untuk periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}