"use client";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function DashboardProfitAreaChart() {
  const [data, setData] = useState<{ labels: string[]; profit: number[] } | null>(null);
  useEffect(() => {
    fetch("/api/dashboard/profit-area")
      .then((res) => res.json())
      .then(setData);
  }, []);
  if (!data) return <div style={{height:220,display:'flex',alignItems:'center',justifyContent:'center'}}>Loading...</div>;
  return (
    <div style={{width:'100%',height:'220px'}}>
      <Line
        data={{
          labels: data.labels,
          datasets: [
            {
              label: "Akumulasi Laba (YTD)",
              data: data.profit,
              borderColor: "#2aa06f",
              backgroundColor: (ctx) => {
                const chart = ctx.chart;
                const {ctx:canvasCtx, chartArea} = chart;
                if (!chartArea) return "rgba(42,160,111,0.1)";
                const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, "rgba(42,160,111,0.34)");
                gradient.addColorStop(1, "rgba(42,160,111,0)");
                return gradient;
              },
              pointRadius: 0,
              pointHoverRadius: 4,
              tension: 0.3,
              fill: true,
              borderWidth: 3,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#fff',
              titleColor: '#222',
              bodyColor: '#222',
              borderColor: '#e0e7ef',
              borderWidth: 1,
              titleFont: { weight: 'bold', size: 13 },
              bodyFont: { size: 12 },
              padding: 10,
            },
          },
          scales: {
            x: {
              grid: {
                color: '#edf2fb',
                lineWidth: 1,
              },
              border: {
                display: false,
              },
              ticks: {
                color: '#405179',
                font: { size: 12 },
              },
            },
            y: {
              min: 0,
              max: 140,
              grid: {
                color: '#edf2fb',
                lineWidth: 1,
              },
              border: {
                display: false,
              },
              ticks: {
                color: '#405179',
                font: { size: 12 },
                stepSize: 20,
              },
            },
          },
          elements: {
            line: {
              borderWidth: 3,
            },
          },
        }}
      />
    </div>
  );
}
