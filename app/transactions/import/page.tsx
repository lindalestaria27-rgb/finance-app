"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { useAuth } from "@/app/context/AuthContext";
import Sidebar from "../../components/Sidebar";
import "./upload.css";

type PreviewRow = {
  date: string;
  category: string;
  amount: string;
  note: string;
  status: "valid" | "invalid";
  message: string;
};

export default function ImportTransactionsPage() {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State File & Status Transmisi
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // State Data Pratinjau Rekaman Baris
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);

  function getAuthHeaderValue(currentToken: string | null): string {
    if (!currentToken) return "";
    return currentToken.toLowerCase().startsWith("bearer ") ? currentToken : `Bearer ${currentToken}`;
  }

  // Membaca file dan memvalidasi secara ketat mengikuti aturan server backend
  function parseCsvLocal(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length <= 1) {
        setErrorMessage("File CSV kosong atau hanya berisi baris header.");
        return;
      }

      // Ambil dan bersihkan nama header
      const rawHeaders = lines[0].split(",").map((cell) => cell.replace(/^["']|["']$/g, "").trim().toLowerCase());
      const dataRows = lines.slice(1);

      // Pencarian index kolom berdasarkan aturan kaku backend
      const dateIdx = rawHeaders.indexOf("transaction_date");
      const catIdx = rawHeaders.indexOf("category");
      const amountIdx = rawHeaders.indexOf("amount");
      const noteIdx = rawHeaders.indexOf("note");

      if (dateIdx === -1 || catIdx === -1 || amountIdx === -1) {
        setErrorMessage("CSV wajib memiliki kolom header: transaction_date, category, amount.");
        return;
      }

      // Regex untuk memvalidasi format tanggal DD-MM-YYYY
      const dateRegex = /^\d{2}-\d{2}-\d{4}$/;

      const parsedRows: PreviewRow[] = dataRows.map((line) => {
        const cols = line.split(",").map((cell) => cell.replace(/^["']|["']$/g, "").trim());
        
        const dateVal = cols[dateIdx] || "";
        const catVal = (cols[catIdx] || "").toLowerCase();
        const amountVal = cols[amountIdx] || "";
        const noteVal = noteIdx !== -1 ? cols[noteIdx] : ""; 

        let isRowValid = true;
        let errorMsg = "Valid";

        if (!dateVal) {
          isRowValid = false;
          errorMsg = "Tanggal kosong";
        } else if (!dateRegex.test(dateVal)) {
          isRowValid = false;
          errorMsg = "Format harus DD-MM-YYYY";
        } else if (!catVal) {
          isRowValid = false;
          errorMsg = "Kategori kosong";
        } else if (catVal !== "in" && catVal !== "out") {
          isRowValid = false;
          errorMsg = "Kategori harus 'in' atau 'out'";
        } else if (!amountVal || isNaN(Number(amountVal.replace(/\D/g, "")))) {
          isRowValid = false;
          errorMsg = "Nominal tidak valid";
        } else if (Number(amountVal.replace(/\D/g, "")) <= 0) {
          isRowValid = false;
          errorMsg = "Nominal harus > 0";
        }

        return {
          date: dateVal,
          category: catVal,
          amount: amountVal,
          note: noteVal,
          status: isRowValid ? "valid" : "invalid",
          message: errorMsg,
        };
      });

      setPreviewRows(parsedRows);
    };

    reader.readAsText(file);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setErrorMessage("");
    setSuccessMessage("");
    setPreviewRows([]);
    
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }

    const file = e.target.files[0];
    setSelectedFile(file);
    parseCsvLocal(file);

    e.target.value = "";
  }

  function triggerFileSelect() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

 async function handleUpload() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedFile) {
      setErrorMessage("Silakan tentukan file dokumen terlebih dahulu.");
      return;
    }

    const authHeader = getAuthHeaderValue(token);
    if (!authHeader) {
      setErrorMessage("Sesi login berakhir, silakan login kembali.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile); 

      const response = await fetch("/api/transactions/bulk-upload", {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || (data && data.success === false)) {
        let backendErrorMsg = "Gagal memproses unggahan.";
        if (data?.detail) {
          backendErrorMsg = Array.isArray(data.detail) ? data.detail.join(" | ") : String(data.detail);
        } else if (data?.server_message) {
          backendErrorMsg = data.server_message;
        }
        setErrorMessage(backendErrorMsg);
        return;
      }

      setSuccessMessage(data.message || "File berhasil diimpor sepenuhnya ke sistem.");
      setSelectedFile(null);
      setPreviewRows([]);
    } catch {
      setErrorMessage("Terjadi kegagalan transmisi jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalValidCount = previewRows.filter((r) => r.status === "valid").length;
  const totalInvalidCount = previewRows.filter((r) => r.status === "invalid").length;

  return (
    <div className="page-shell">
      <Sidebar active="transactions" />

      <main className="main-content">
        <header className="page-head" style={{ marginBottom: "20px" }}>
          <div>
            <p className="eyebrow">Impor Data</p>
            <h1>Impor Transaksi Historis</h1>
            <p className="subtitle">Unggah file langsung untuk pemrosesan transaksi massal.</p>
          </div>
        </header>

        <section className="transaction-grid" style={{ display: "grid", alignItems: "stretch", gap: "24px", margin: 0, padding: 0 }}>
          
          {/* SISI KIRI (320px) - Area Unggah File */}
          <article className="panel" style={{ margin: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="ledger-head" style={{ paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid #eef2f8" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Unggah File</h3>
                  <p className="ledger-summary" style={{ margin: "4px 0 0" }}>Format berkas didukung: CSV</p>
                </div>
              </div>
              
              <div className="entry-form" style={{ margin: 0, padding: 0 }}>
                <div 
                  className="upload-box" 
                  onClick={triggerFileSelect}
                  style={{
                    border: "1px dashed #b9caea",
                    background: "#f7faff",
                    borderRadius: "10px",
                    padding: "40px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    width: "100%",
                    boxSizing: "border-box"
                  }}
                >
                  <p style={{ margin: 0, color: "#4f628f", fontSize: "0.84rem", fontWeight: 500, lineHeight: "1.5" }}>
                    {selectedFile 
                      ? `Terpilih: ${selectedFile.name}` 
                      : "Taruh file CSV di sini atau klik untuk memilih"
                    }
                  </p>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept=".csv" 
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            <p className="ledger-summary" style={{ margin: "16px 0 0", fontSize: "0.72rem", color: "#60739f", lineHeight: "1.4" }}>
              * Baris pertama CSV wajib bernama persis: <br /><strong>transaction_date, category, amount</strong>.
              <br /><br />
              * Format tanggal wajib <strong>DD-MM-YYYY</strong>.
              <br />
              * Kategori wajib berupa teks <strong>in</strong> atau <strong>out</strong>.
            </p>
          </article>

          {/* SISI KANAN (1fr) - Pratinjau Validasi Data / Status Sukses */}
          <article className="panel" style={{ margin: 0, display: "flex", flexDirection: "column" }}>
            <div className="ledger-head" style={{ paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid #eef2f8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Pratinjau Validasi</h3>
                <p className="ledger-summary" style={{ margin: "4px 0 0" }}>Hasil ekstraksi kolom file yang terdeteksi.</p>
              </div>
              
              {!successMessage && (
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span className="tag in">{totalValidCount} baris valid</span>
                  {totalInvalidCount > 0 && (
                    <span className="tag out" style={{ background: "#fff3df", color: "#9a620a" }}>
                      {totalInvalidCount} baris perlu ditinjau
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Menampilkan Tampilan Sukses ATAU Tampilan Tabel Pratinjau */}
            {successMessage ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 20px" }}>
                <h3 style={{ margin: "0 0 8px", color: "#1c5c47", fontSize: "1.2rem" }}>Berhasil!</h3>
                <p style={{ margin: "0 0 24px", color: "#60739f", fontSize: "0.86rem" }}>{successMessage}</p>
                <a 
                  href="/transactions" 
                  className="btn-primary"
                  style={{ minWidth: "180px", height: "42px", textDecoration: "none" }}
                >
                  Cek di Page Transaksi
                </a>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div className="form-error" style={{ marginBottom: "16px", marginTop: 0 }}>{errorMessage}</div>
                )}

                <div className="table-wrap" style={{ flex: 1, margin: 0 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Kategori</th>
                        <th>Nominal</th>
                        <th>Catatan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", color: "#60739f", padding: "60px 0" }}>
                            Belum ada rekaman file yang masuk untuk diverifikasi.
                          </td>
                        </tr>
                      ) : (
                        previewRows.map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.date}</td>
                            <td>
                              <span className={`tag ${row.category === "in" ? "in" : row.category === "out" ? "out" : ""}`}>
                                {row.category || "-"}
                              </span>
                            </td>
                            <td className={`amount ${row.category === "in" ? "pos" : row.category === "out" ? "neg" : ""}`}>
                              {isNaN(Number(row.amount.replace(/\D/g, ""))) 
                                ? row.amount 
                                : (row.category === "out" ? "- " : "+ ") + Number(row.amount.replace(/\D/g, "")).toLocaleString("id-ID")
                              }
                            </td>
                            <td>{row.note || "-"}</td>
                            <td>
                              <span className={`tag ${row.status === "valid" ? "in" : "out"}`}>
                                {row.message}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Tombol Aksi Impor Menempel Rapi di Pojok Kanan Bawah */}
                {previewRows.length > 0 && totalValidCount > 0 && (
                  <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", padding: 0 }}>
                    <button 
                      className="btn-primary" 
                      type="button" 
                      onClick={handleUpload}
                      disabled={isSubmitting}
                      style={{ minWidth: "160px", height: "40px", margin: 0 }}
                    >
                      {isSubmitting ? "Memproses..." : "Impor Baris Valid"}
                    </button>
                  </div>
                )}
              </>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}