"use client";

import React from "react";
import { useRouter } from "next/navigation";
import useSidebarCollapse from "../dashboard/useSidebarCollapse";
import { useAuth } from "@/app/context/AuthContext";
import "./sidebar.css";

export type SidebarActive = "dashboard" | "transactions" | "reports" | "predictions" | string;

interface Props {
  active?: SidebarActive;
}

export default function Sidebar({ active = "" }: Props) {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  useSidebarCollapse();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
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
        <a href="/dashboard" className={`nav-link ${active === "dashboard" ? "active" : ""}`}><span className="nav-icon">▦</span><span className="nav-text">Dasbor</span></a>
        <a href="/transactions" className={`nav-link ${active === "transactions" ? "active" : ""}`}><span className="nav-icon">↹</span><span className="nav-text">Transaksi</span></a>
        <a href="/reports" className={`nav-link ${active === "reports" ? "active" : ""}`}><span className="nav-icon">▤</span><span className="nav-text">Laporan</span></a>
        <a href="/predictions" className={`nav-link ${active === "predictions" ? "active" : ""}`}><span className="nav-icon">◔</span><span className="nav-text">Prediksi</span></a>
      </nav>

      <div className="sidebar-foot">
        <p className="user-name">{user?.username || "Guest"}</p>
        <p className="user-role">{user?.role || "User"}</p>
      </div>
      <div className="sidebar-logout">
        <button
          type="button"
          className="btn-logout"
          onClick={handleLogout}
          aria-label="Keluar"
        >
          <span className="nav-icon">
            <svg className="icon-logout" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16 13V11H8V8L3 12L8 16V13H16Z" fill="currentColor" />
              <path d="M20 3H12V5H20V19H12V21H20C21.1046 21 22 20.1046 22 19V5C22 3.89543 21.1046 3 20 3Z" fill="currentColor" />
            </svg>
          </span>
          <span className="nav-text">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
