"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import { useAuth } from "@/app/context/AuthContext";
import "../transactions/transactions.css";

type Vehicle = {
  id?: string;
  plat_nomor: string;
  merek: string;
  model: string;
  tahun: number;
  tarif_sewa: number;
  status: string;
};

export default function VehiclesPage() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Vehicle>>({});
  const [isAdding, setIsAdding] = useState(false);

  const [displayTarif, setDisplayTarif] = useState("");

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 5;

  function getAuthHeader() {
    if (!token) return null;
    return token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`;
  }

  async function loadVehicles() {
    const auth = getAuthHeader();
    if (!auth) return;
    try {
      setLoading(true);
      const res = await fetch('/api/vehicles', { headers: { Authorization: auth }, cache: 'no-store' });
      const data = await res.json().catch(() => null);
      setVehicles(data?.items ?? []);
    } catch (e) {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    void loadVehicles();
  }, [token]);

  function clearForm() {
    setForm({});
    setDisplayTarif("");
    setError("");
    setEditingId(null);
  }

  function openAdd() {
    clearForm();
    setIsAdding(true);
  }

  function cancelAdd() {
    clearForm();
    setIsAdding(false);
  }

  // Fungsi helper untuk memformat angka murni menjadi string ber-titik (.id-ID)
  function formatIdr(value: number | string) {
    if (!value && value !== 0) return "";
    const cleanNumber = value.toString().replace(/\D/g, "");
    if (!cleanNumber) return "";
    return Number(cleanNumber).toLocaleString("id-ID");
  }

  function handleTarifChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawValue = e.target.value.replace(/\D/g, ""); 
    const numericValue = rawValue ? Number(rawValue) : 0;
    
    setDisplayTarif(formatIdr(rawValue));
    setForm((s) => ({ ...s, tarif_sewa: numericValue }));
  }

  // Handle perubahan untuk teks/angka biasa agar state ter-update secara presisi
  function handleInputChange(field: keyof Vehicle, value: string | number) {
    setForm((s) => ({ ...s, [field]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const auth = getAuthHeader();
    if (!auth) { setError('Unauthorized'); return; }

    const payload = {
      plat_nomor: form.plat_nomor ?? "",
      merek: form.merek ?? "",
      model: form.model ?? "",
      tahun: Number(form.tahun ?? 0),
      tarif_sewa: Number(form.tarif_sewa ?? 0),
      status: form.status ?? "aktif"
    };

    try {
      setLoading(true);
      const res = await fetch('/api/vehicles', { 
        method: 'POST', 
        headers: { Authorization: auth, 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.id) {
        setError(data?.detail ?? data?.server_message ?? 'Gagal menambah kendaraan');
        return;
      }
      setVehicles((prev) => [...prev, data]);
      clearForm();
      setIsAdding(false);
    } catch (e) {
      setError('Gagal menambah kendaraan');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(v: Vehicle) {
    setError("");
    setEditingId(v.id ?? null);
    setForm({
      plat_nomor: v.plat_nomor,
      merek: v.merek,
      model: v.model,
      tahun: v.tahun,
      tarif_sewa: v.tarif_sewa,
      status: v.status
    });
    setDisplayTarif(formatIdr(v.tarif_sewa));
    setIsAdding(true);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError("");
    const auth = getAuthHeader();
    if (!auth) { setError('Unauthorized'); return; }

    // Payload flat sesuai format yang diminta
    const payload = {
      plat_nomor: form.plat_nomor ?? "",
      merek: form.merek ?? "",
      model: form.model ?? "",
      tahun: Number(form.tahun ?? 0),
      tarif_sewa: Number(form.tarif_sewa ?? 0),
      status: form.status ?? "aktif"
    };

    try {
      setLoading(true);
      const res = await fetch(`/api/vehicles/${editingId}`, { 
        method: 'PATCH', 
        headers: { Authorization: auth, 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.id) {
        setError(data?.detail ?? data?.server_message ?? 'Gagal memperbarui kendaraan');
        return;
      }
      
      setVehicles((prev) => prev.map((p) => (p.id === editingId ? data : p)));
      clearForm();
      setIsAdding(false);
    } catch (e) {
      setError('Gagal memperbarui kendaraan');
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteClick(id?: string) {
    if (!id) return;
    setPendingDeleteId(id);
  }

  function cancelDelete() {
    setPendingDeleteId(null);
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    const auth = getAuthHeader();
    if (!auth) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/vehicles/${pendingDeleteId}`, { method: 'DELETE', headers: { Authorization: auth } });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        alert(data?.detail ?? data?.server_message ?? 'Gagal menghapus kendaraan');
        return;
      }
      setVehicles((prev) => prev.filter((v) => v.id !== pendingDeleteId));
      setPendingDeleteId(null);
    } catch (e) {
      alert('Gagal menghapus kendaraan');
    } finally {
      setIsDeleting(false);
    }
  }

  function getStatusLabel(statusValue: string) {
    switch (statusValue) {
      case "aktif": return "Aktif";
      case "dalam_perawatan": return "Dalam Perawatan";
      case "tidak_aktif": return "Tidak Aktif";
      default: return statusValue;
    }
  }

  function getStatusBadgeClass(statusValue: string) {
    switch (statusValue) {
      case "aktif": return "badge-income";
      case "dalam_perawatan": return "badge-waiting"; 
      case "tidak_aktif": return "badge-expense";
      default: return "";
    }
  }

  return (
    <div className="page-shell">
      <Sidebar active="vehicles" />
      <main className="main-content">
        <header className="page-head">
          <div>
            <p className="eyebrow">Intelijen Keuangan</p>
            <h1>Manajemen Kendaraan</h1>
            <p className="subtitle">Tambah, ubah, dan hapus data kendaraan</p>
          </div>
          <div className="head-actions">
            {!isAdding && (
              <button type="button" className="btn-primary" onClick={openAdd}>+ Tambah</button>
            )}
          </div>
        </header>

        <section className="transaction-grid">
          {isAdding && (
            <article className="panel quick-entry">
              <h3 id="entryTitle">{editingId ? 'Ubah Kendaraan' : 'Tambah Kendaraan'}</h3>
              <form onSubmit={editingId ? handleUpdate : handleCreate} className="entry-form">
                <label htmlFor="platInput">Plat Nomor</label>
                <input 
                  id="platInput" 
                  type="text"
                  placeholder="Contoh: B 1234 CBD"
                  value={form.plat_nomor ?? ""} 
                  onChange={(e) => handleInputChange("plat_nomor", e.target.value)} 
                  required 
                />

                <label htmlFor="merekInput">Merek</label>
                <input 
                  id="merekInput"
                  type="text"
                  placeholder="Contoh: Toyota"
                  value={form.merek ?? ""} 
                  onChange={(e) => handleInputChange("merek", e.target.value)} 
                  required 
                />

                <label htmlFor="modelInput">Model</label>
                <input 
                  id="modelInput"
                  type="text"
                  placeholder="Contoh: Avanza"
                  value={form.model ?? ""} 
                  onChange={(e) => handleInputChange("model", e.target.value)} 
                  required 
                />

                <label htmlFor="tahunInput">Tahun</label>
                <input 
                  id="tahunInput"
                  type="number" 
                  placeholder="Contoh: 2022"
                  value={form.tahun ?? ""} 
                  onChange={(e) => handleInputChange("tahun", Number(e.target.value))} 
                  required 
                />

                <label htmlFor="tarifInput">Tarif Sewa</label>
                <input 
                  id="tarifInput"
                  type="text" 
                  inputMode="numeric"
                  placeholder="Contoh: 350.000"
                  value={displayTarif} 
                  onChange={handleTarifChange} 
                  required 
                />

                <label htmlFor="statusInput">Status</label>
                <div className="relative">
                  <select
                    id="statusInput"
                    value={form.status ?? "aktif"}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    required
                    className="appearance-none pr-12 w-full"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="dalam_perawatan">Dalam Perawatan</option>
                    <option value="tidak_aktif">Tidak Aktif</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#405179]"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M7 10l5 5 5-5z" fill="currentColor" />
                  </svg>
                </div>

                <button type="submit" className="btn-primary btn-full">
                  {loading ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Kendaraan'}
                </button>
                <button type="button" className="btn-ghost btn-full btn-cancel-edit" onClick={cancelAdd}>
                  Batal
                </button>
                {error && <p className="form-error">{error}</p>}
              </form>
            </article>
          )}

          <article className={`panel ledger ${!isAdding ? 'full-ledger' : ''}`}>
            <div className="ledger-head">
              <div>
                <h3>Daftar Kendaraan</h3>
                <p className="ledger-summary">Total kendaraan: {vehicles.length}</p>
              </div>
            </div>
            <div className="table-wrap">
              <table id="transactionTable">
                <thead>
                  <tr>
                    <th className="col-header-number">No.</th>
                    <th>Plat</th>
                    <th>Merek</th>
                    <th>Model</th>
                    <th>Tahun</th>
                    <th>Tarif</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: pageSize }).map((_, idx) => (
                      <tr key={`skeleton-${idx}`} className="skeleton-row">
                        <td className="col-header-number"><span className="skeleton skeleton-text"></span></td>
                        <td><span className="skeleton skeleton-text"></span></td>
                        <td><span className="skeleton skeleton-text"></span></td>
                        <td><span className="skeleton skeleton-text"></span></td>
                        <td><span className="skeleton skeleton-text"></span></td>
                        <td><span className="skeleton skeleton-text"></span></td>
                        <td><span className="skeleton skeleton-badge"></span></td>
                        <td className="actions"><span className="skeleton skeleton-button"></span></td>
                      </tr>
                    ))
                  ) : vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "2rem" }}>
                        Tidak ada data kendaraan.
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((v, idx) => (
                      <tr key={v.id}>
                        <td className="col-header-number">{idx + 1}</td>
                        <td style={{ fontWeight: 500 }}>{v.plat_nomor}</td>
                        <td>{v.merek}</td>
                        <td>{v.model}</td>
                        <td>{v.tahun}</td>
                        <td>Rp{formatIdr(v.tarif_sewa)}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(v.status)}`}>
                            {getStatusLabel(v.status)}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button type="button" onClick={() => startEdit(v)}>Ubah</button>
                            <button type="button" onClick={() => handleDeleteClick(v.id)} className="danger">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </main>

      {/* Modal Backdrop Konfirmasi Hapus */}
      <div className="modal-backdrop" id="deleteModal" hidden={pendingDeleteId == null}>
        <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="deleteModalTitle">
          <h3 id="deleteModalTitle">Konfirmasi Hapus</h3>
          <p>Yakin ingin menghapus data kendaraan ini?</p>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" id="deleteNoBtn" onClick={cancelDelete} disabled={isDeleting}>
              Tidak
            </button>
            <button
              type="button"
              className={`btn-danger ${isDeleting ? "is-loading" : ""}`}
              id="deleteYesBtn"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="spinner"></span>
                  Menghapus...
                </>
              ) : (
                "Ya"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}