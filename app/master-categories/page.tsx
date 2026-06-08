"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import { useAuth } from "@/app/context/AuthContext";
import "../transactions/transactions.css";

type Category = {
  id: string;
  name: string;
  type: "in" | "out";
  is_default?: boolean;
  organization_id?: string;
  created_at?: string;
};

export default function MasterCategoriesPage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  const pageSize = 5;

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"in" | "out">("out");

  useEffect(() => {
    try {
      const cachedCats = localStorage.getItem("rfc-categories");
      if (cachedCats) setCategories(JSON.parse(cachedCats));
    } catch (e) {
      // ignore
    }
  }, []);

  function getAuthHeaderValue(currentToken: string | null): string | null {
    if (!currentToken) {
      return null;
    }
    return currentToken.toLowerCase().startsWith("bearer ")
      ? currentToken
      : `Bearer ${currentToken}`;
  }

  async function loadCategories() {
    const authHeader = getAuthHeaderValue(token);
    if (!authHeader) {
      setCategories([]);
      return;
    }

    try {
      setIsLoadingCategories(true);
      const response = await fetch("/api/master-categories", {
        headers: {
          Authorization: authHeader,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        setCategories([]);
        localStorage.setItem("rfc-categories", JSON.stringify([]));
        return;
      }

      const data = await response.json();
      const list = data.data ?? [];
      setCategories(list);
      try {
        localStorage.setItem("rfc-categories", JSON.stringify(list));
      } catch {}
    } catch {
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }

  useEffect(() => {
    if (isAuthLoading) return;
    void loadCategories();
  }, [isAuthLoading, token]);

  function clearForm() {
    setFormName("");
    setFormType("out");
    setFormError("");
  }

  function openAdd() {
    clearForm();
    setIsAdding(true);
  }

  function handleCancelAdd() {
    clearForm();
    setIsAdding(false);
  }

  function handleDeleteClick(id: string) {
    setPendingDeleteId(id);
  }

  function cancelDelete() {
    setPendingDeleteId(null);
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;

    const authHeader = getAuthHeaderValue(token);
    if (!authHeader) {
      alert("Sesi login tidak ditemukan, silakan login ulang");
      setPendingDeleteId(null);
      return;
    }

    setIsDeletingCategory(true);
    try {
      const response = await fetch(`/api/master-categories/${pendingDeleteId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      });

      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        server_message?: string;
        detail?: string;
      } | null;

      if (!response.ok || !data?.success) {
        alert(data?.server_message ?? data?.detail ?? "Gagal menghapus kategori");
        return;
      }

      const updated = categories.filter((c) => c.id !== pendingDeleteId);
      setCategories(updated);
      try {
        localStorage.setItem("rfc-categories", JSON.stringify(updated));
      } catch {}
      setPendingDeleteId(null);
    } catch {
      alert("Gagal menghapus kategori");
    } finally {
      setIsDeletingCategory(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const nameText = formName.trim();
    if (!nameText) {
      setFormError("Nama kategori tidak boleh kosong");
      return;
    }

    const authHeader = getAuthHeaderValue(token);
    if (!authHeader) {
      setFormError("Sesi login tidak ditemukan, silakan login ulang");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/master-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ name: nameText, type: formType }),
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.id) {
        setFormError(data?.server_message ?? "Gagal menyimpan kategori");
        return;
      }

      const updated = [...categories, data];
      setCategories(updated);
      try {
        localStorage.setItem("rfc-categories", JSON.stringify(updated));
      } catch {}
      
      clearForm();
      setIsAdding(false);
    } catch {
      setFormError("Gagal menyimpan kategori");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-shell">
      <Sidebar active="master-categories" />

      <main className="main-content">
        <header className="page-head">
          <div>
            <p className="eyebrow">Intelijen Keuangan</p>
            <h1>Master Kategori</h1>
            <p className="subtitle">Kelola kategori pemasukan dan pengeluaran secara terstruktur.</p>
          </div>
          <div className="head-actions">
            {!isAdding && (
              <button className="btn-primary" type="button" onClick={openAdd}>
                + Tambah Kategori
              </button>
            )}
          </div>
        </header>

        <section className="transaction-grid">
          {isAdding && (
            <article className="panel quick-entry">
              <h3 id="entryTitle">Tambah Kategori</h3>
              <form className="entry-form" onSubmit={handleSubmit}>
                <label htmlFor="categoryName">Nama Kategori</label>
                <input
                  id="categoryName"
                  name="categoryName"
                  type="text"
                  placeholder="Contoh: Gaji Operational"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />

                <label htmlFor="categoryType">Tipe Aliran Dana</label>
                <div className="relative">
                  <select
                    id="categoryType"
                    name="categoryType"
                    required
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as "in" | "out")}
                    className="appearance-none pr-12 w-full"
                  >
                    <option value="out">Pengeluaran (Out)</option>
                    <option value="in">Pendapatan (In)</option>
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

                {formError && <p className="text-sm text-red-600">{formError}</p>}

                <button type="submit" className="btn-primary btn-full" id="submitEntryBtn" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Kategori"}
                </button>
                <button
                  type="button"
                  className="btn-ghost btn-full btn-cancel-edit"
                  id="cancelEditBtn"
                  onClick={handleCancelAdd}
                >
                  Batal
                </button>
              </form>
            </article>
          )}

          <article className={`panel ledger ${!isAdding ? "full-ledger" : ""}`}>
            <div className="ledger-head">
              <div>
                <h3>Daftar Kategori</h3>
                <p className="ledger-summary">Total kategori: {categories.length}</p>
              </div>
            </div>
            <div className="table-wrap">
              <table id="transactionTable">
                <thead>
                  <tr>
                    <th className="col-header-number">No.</th>
                    <th>Nama Kategori</th>
                    <th>Tipe Aliran Dana</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingCategories ? (
                    /* Render Skeleton Rows untuk Kategori (4 Kolom) */
                    Array.from({ length: pageSize }).map((_, idx) => (
                      <tr key={`skeleton-${idx}`} className="skeleton-row">
                        <td className="col-header-number"><span className="skeleton skeleton-text"></span></td>
                        <td><span className="skeleton skeleton-text"></span></td>
                        <td><span className="skeleton skeleton-badge"></span></td>
                        <td className="actions"><span className="skeleton skeleton-button"></span></td>
                      </tr>
                    ))
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                        Tidak ada data kategori.
                      </td>
                    </tr>
                  ) : (
                    categories.map((category, index) => (
                      <tr key={category.id}>
                        <td className="col-header-number">{index + 1}</td>
                        <td style={{ fontWeight: 500 }}>{category.name}</td>
                        <td>
                          <span className={`badge ${category.type === "in" ? "badge-income" : "badge-expense"}`}>
                            {category.type === "in" ? "Pendapatan" : "Pengeluaran"}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              type="button"
                              className="danger"
                              onClick={() => handleDeleteClick(category.id)}
                            >
                              Hapus
                            </button>
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

      <div className="modal-backdrop" id="deleteModal" hidden={pendingDeleteId == null}>
        <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="deleteModalTitle">
          <h3 id="deleteModalTitle">Konfirmasi Hapus</h3>
          <p>Yakin ingin menghapus kategori ini?</p>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" id="deleteNoBtn" onClick={cancelDelete} disabled={isDeletingCategory}>
              Tidak
            </button>
            <button
              type="button"
              className={`btn-danger ${isDeletingCategory ? "is-loading" : ""}`}
              id="deleteYesBtn"
              onClick={confirmDelete}
              disabled={isDeletingCategory}
            >
              {isDeletingCategory ? (
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