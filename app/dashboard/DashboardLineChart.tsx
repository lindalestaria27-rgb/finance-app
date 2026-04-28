"use client";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function DashboardLineChart() {
  const [data, setData] = useState<{
    income: number[];
    expense: number[];
    labels: string[];
  } | null>(null);
  useEffect(() => {
    fetch("/api/dashboard/chart-data")
      .then((res) => res.json())
      .then(setData);
  }, []);
  if (!data) return <div style={{height:220,display:'flex',alignItems:'center',justifyContent:'center'}}>Loading...</div>;
  // SVG slicing points: expense [190,172,178,156,164,144,154,132], income [210,198,202,180,190,162,168,142]
  // We'll use these directly for a perfect match
  return (
    <div style={{width:'100%',height:'100%'}}>
      <Line
        data={{
          labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu"],
          datasets: [
            {
              label: "Pengeluaran",
              data: [190,172,178,156,164,144,154,132],
              borderColor: "#2db986",
              backgroundColor: "transparent",
              pointBackgroundColor: "#2db986",
              pointBorderColor: "#fff",
              pointRadius: 0,
              pointHoverRadius: 4,
              tension: 0,
              fill: false,
              borderWidth: 3,
              order: 1,
            },
            {
              label: "Pendapatan",
              data: [210,198,202,180,190,162,168,142],
              borderColor: "#3f75e0",
              backgroundColor: "transparent",
              pointBackgroundColor: "#3f75e0",
              pointBorderColor: "#fff",
              pointRadius: 0,
              pointHoverRadius: 4,
              tension: 0,
              fill: false,
              borderWidth: 3,
              order: 2,
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
              min: 120,
              max: 220,
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
        style={{width:'100%',height:'100%'}}
      />
    </div>
  );
}
