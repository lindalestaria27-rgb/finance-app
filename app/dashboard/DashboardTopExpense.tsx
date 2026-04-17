"use client";
import { useEffect, useState } from "react";

export default function DashboardTopExpense() {
  const [data, setData] = useState<{ items: { label: string; value: number }[] } | null>(null);
  useEffect(() => {
    fetch("/api/dashboard/top-expense")
      .then((res) => res.json())
      .then(setData);
  }, []);
  if (!data) return <div style={{height:120,display:'flex',alignItems:'center',justifyContent:'center'}}>Loading...</div>;
  // Find max value for width scaling
  const max = Math.max(...data.items.map(i => i.value));
  return (
    <div className="hbars" aria-hidden="true">
      {data.items.map((item, idx) => (
        <div className="hrow" key={item.label}>
          <span>{item.label}</span>
          <i style={{
            // @ts-ignore
            '--w': `${(item.value / max) * 100}%`
          } as React.CSSProperties}></i>
        </div>
      ))}
    </div>
  );
}
