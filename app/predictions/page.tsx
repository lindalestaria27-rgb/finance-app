"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "./predictions.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function PrediksiPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPredictions = () => {
    setLoading(true);
    fetch("/api/predictions")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  if (!data && loading) return <div className="loading">Memuat data...</div>;
  if (!data) return <div className="loading">Tidak ada data tersedia.</div>;

  const format = (v: number) => "Rp" + v.toLocaleString("id-ID").replace(/,/g, ".");

  const chartData = data.history.map((h: any, index: number) => {
    const isLast = index === data.history.length - 1;
    return {
      name: h.bulan,
      aktual: h.value,
      prediksi: isLast ? h.value : null, 
    };
  });

  chartData.push({
    name: data.prediction.bulan + "*",
    aktual: null,
    prediksi: data.prediction.value,
  });

  return (
    <div className="dashboard-shell">
      <Sidebar active="prediksi" />

      <main className="main-area">
        <div className="pred-header">
          <div>
            <p className="mini">INTELIJEN KEUANGAN</p>
            <h1 className="title-bold">Prediksi Pendapatan</h1>
            <p className="desc">
              Prediksi pendapatan bulan berikutnya berdasarkan data historis.
            </p>
          </div>

          <button 
            className="btn-run" 
            onClick={fetchPredictions} 
            disabled={loading}
          >
            {loading ? "Memproses..." : "Jalankan Prediksi"}
          </button>
        </div>

        <div className="kpi-row">
          <div className="kpi highlight">
            <p>PREDIKSI PENDAPATAN (BULAN DEPAN)</p>
            <h2 className="title-bold">{format(data.prediction.value)}</h2>
            <span>Periode prediksi: {data.prediction.bulan} 2026</span>
          </div>

          <div className="kpi">
            <p>DATA HISTORIS DIGUNAKAN</p>
            <h2 className="title-bold">{data.history.length} Bulan</h2>
            <span>{data.history[0].bulan} 2026 - {data.history[data.history.length - 1].bulan} 2026</span>
          </div>

          <div className="kpi">
            <p>AKURASI MODEL (MAPE)</p>
            <h2 className="title-bold">{data.mape}%</h2>
            <span>Target maksimum 20%</span>
          </div>
        </div>

        <div className="pred-grid">
          <div className="card big">
            <div className="card-header">
              <div>
                <h3 className="title-bold">Tren Aktual vs Prediksi</h3>
                <p>Hasil model terhadap pendapatan historis bulanan</p>
              </div>

              <div className="legend">
                <div><span className="dot blue" /> Aktual</div>
                <div><span className="dot green" /> Prediksi</div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10} 
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(val) => `Rp${(val / 1000000000).toFixed(0)}M`}
                />
                <Tooltip formatter={(value) => format(Number(value ?? 0))} />

                <Line
                  connectNulls
                  type="monotone"
                  dataKey="aktual"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  connectNulls
                  type="monotone"
                  dataKey="prediksi"
                  stroke="#10b981"
                  strokeWidth={3}
                  strokeDasharray="6 6"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card side">
            <h3 className="title-bold" style={{ marginBottom: '16px' }}>Input Historis</h3>

            <div className="table-container">
              <div className="table-header">
                <span>BULAN</span>
                <span className="text-right">PENDAPATAN</span>
              </div>

              <div className="table-body">
                {data.history.map((h: any, i: number) => (
                  <div key={i} className="tr">
                    <span>{h.bulan} 2026</span>
                    <span className="text-right">{format(h.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="status">
              <span className="status-title">STATUS PREDIKSI</span>
              <p className="status-main">Data historis memenuhi syarat minimal 6 bulan</p>
              <p className="status-sub">Prediksi {data.prediction.bulan} 2026 dapat ditampilkan.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}