"use client";
import { useEffect, useState } from "react";

interface Kpi {
  label: string;
  value: string;
  trend: string;
  trendType: "up" | "down";
  dark?: boolean;
}

export default function DashboardKpiCards() {
  const [data, setData] = useState<{ kpis: Kpi[] } | null>(null);
  useEffect(() => {
    fetch("/api/dashboard/kpi")
      .then((res) => res.json())
      .then(setData);
  }, []);
  if (!data) return <div style={{height:80,display:'flex',alignItems:'center',justifyContent:'center'}}>Loading...</div>;
  return (
    <section className="kpi-grid">
      {data.kpis.map((kpi, idx) => (
        <article className={`kpi-card${kpi.dark ? " dark" : ""}`} key={kpi.label}>
          <p className="kpi-label">{kpi.label}</p>
          <h2>{kpi.value}</h2>
          <p className={`kpi-trend ${kpi.trendType}`}>{kpi.trend}</p>
        </article>
      ))}
    </section>
  );
}
