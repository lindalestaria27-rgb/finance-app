"use client";

import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { format, isValid, parseISO } from "date-fns";
import { useAuth } from "@/app/context/AuthContext";
import TransactionTable, { Transaction } from "./TransactionTable";
import Sidebar from "../components/Sidebar";
import "./transactions.css";

type TransactionsApiResponse = {
  items: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
};

type MasterCategory = {
  id: string;
  name: string;
  type: "in" | "out";
  is_default: boolean;
  organization_id: string;
  created_at: string;
};

type Vehicle = {
  id: string;
  plat_nomor: string;
  merek: string;
  model: string;
  tahun: number;
  tarif_sewa: number;
  status: string;
  organization_id: string;
  created_at: string;
};

type PaginationItem = number | "ellipsis";

export default function TransactionsPage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const [highlightedTransactionId, setHighlightedTransactionId] = useState<string | null>(null);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const [formDate, setFormDate] = useState<Date | null>(null);
  const [formCategoryType, setFormCategoryType] = useState<"income" | "expense" | "">("");
  const [formAmount, setFormAmount] = useState<string>("");
  const [formNote, setFormNote] = useState("");
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cachedCats = localStorage.getItem('rfc-categories');
      if (cachedCats) setCategories(JSON.parse(cachedCats));
      const cachedV = localStorage.getItem('rfc-vehicles');
      if (cachedV) setVehicles(JSON.parse(cachedV));
    } catch (e) {
      // ignore cache fail
    }
  }, []);

  useEffect(() => {
    if (!highlightedTransactionId) return;
    const timer = setTimeout(() => setHighlightedTransactionId(null), 2000);
    return () => clearTimeout(timer);
  }, [highlightedTransactionId]);

  function getAuthHeaderValue(currentToken: string | null): string | null {
    if (!currentToken) return null;
    return currentToken.toLowerCase().startsWith("bearer ") ? currentToken : `Bearer ${currentToken}`;
  }

  const selectedCategory = categories.find((cat) => String(cat.id).trim() === String(selectedCategoryId).trim());
  const showVehicleDropdown = !!selectedCategory?.name?.toLowerCase().includes("rental mobil");

  useEffect(() => {
    if (!token) return;

    async function loadCategories() {
      try {
        setIsLoadingCategories(true);
        const response = await fetch("/api/master-categories", {
          headers: { Authorization: getAuthHeaderValue(token) || "" },
          cache: "no-store"
        });

        if (!response.ok) return;

        const data = await response.json();
        const list = data.data ?? [];
        setCategories(list);
        try { localStorage.setItem('rfc-categories', JSON.stringify(list)); } catch {}
      } catch {
        // Tetap gunakan data cache jika request gagal
      } finally {
        setIsLoadingCategories(false);
      }
    }

    void loadCategories();
  }, [token]);

  useEffect(() => {
    if (!token) {
      setVehicles([]);
      setSelectedVehicleId("");
      return;
    }

    async function loadVehicles() {
      try {
        setIsLoadingVehicles(true);
        const response = await fetch("/api/vehicles", {
          headers: { Authorization: getAuthHeaderValue(token) || "" },
          cache: "no-store"
        });

        if (!response.ok) return;

        const data = await response.json();
        const list = data.items ?? [];
        setVehicles(list);
        try { localStorage.setItem('rfc-vehicles', JSON.stringify(list)); } catch {}
      } catch {
        // Tetap gunakan data cache jika request gagal
      } finally {
        setIsLoadingVehicles(false);
      }
    }

    void loadVehicles();
  }, [token]);

  async function loadTransactions(page: number) {
    const authHeader = getAuthHeaderValue(token);
    if (!authHeader) {
      setTransactions([]);
      setCurrentPage(1);
      setTotalItems(0);
      setTotalPages(1);
      return;
    }

    try {
      setIsLoadingTransactions(true);
      const response = await fetch(`/api/transactions?page=${page}&limit=${pageSize}`, {
        cache: "no-store",
        headers: { Authorization: authHeader }
      });
      const data = (await response.json()) as TransactionsApiResponse;
      setTransactions(data.items ?? []);
      setCurrentPage(data.pagination?.page ?? page);
      setPageSize(data.pagination?.limit ?? pageSize);
      setTotalItems(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch {
      setTransactions([]);
      setCurrentPage(1);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoadingTransactions(false);
    }
  }

  useEffect(() => {
    if (isAuthLoading) return;
    void loadTransactions(currentPage);
  }, [isAuthLoading, token, currentPage, pageSize]);

  function clearForm() {
    setFormDate(null);
    setFormCategoryType("");
    setSelectedCategoryId("");
    setSelectedVehicleId("");
    setFormAmount("");
    setFormNote("");
    setFormError("");
    setEditingIndex(null);
    setEditingTransactionId(null);
  }

  function openAdd() {
    clearForm();
    setIsAdding(true);
  }

  function handleEdit(index: number) {
    const t = transactions[index];
    setEditingIndex(index);
    setIsAdding(true);
    setEditingTransactionId(t.id ?? null);
    setFormDate(formatDateForDisplay(t.date));
    setFormCategoryType(t.category === "income" ? "income" : t.category === "expense" ? "expense" : "");
    
    const matchedCat = categories.find(c => String(c.id).trim() === String(t.category_id || "").trim());
    if (matchedCat) {
      setSelectedCategoryId(matchedCat.id);
    } else {
      setSelectedCategoryId("");
    }
    
    setSelectedVehicleId(t.vehicle_id ?? "");
    setFormAmount(String(t.amount));
    setFormNote(t.note);
    setFormError("");
  }

  function handleDelete(index: number) {
    setPendingDeleteIndex(index);
  }

  function confirmDelete() {
    if (pendingDeleteIndex == null) return;
    const transactionToDelete = transactions[pendingDeleteIndex];
    if (!transactionToDelete.id) return;

    const authHeader = getAuthHeaderValue(token);
    if (!authHeader) return;

    setIsDeletingTransaction(true);
    fetch(`/api/transactions/${transactionToDelete.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader
      }
    })
      .then(async (response) => {
        if (!response.ok) return;
        await loadTransactions(currentPage);
        setPendingDeleteIndex(null);
      })
      .catch(() => alert("Gagal menghapus transaksi"))
      .finally(() => setIsDeletingTransaction(false));
  }

  function cancelDelete() {
    setPendingDeleteIndex(null);
  }

  function formatAmountInput(value: string): string {
    if (!value) return "";
    return Number(value).toLocaleString("id-ID");
  }

  function normalizeAmountInput(value: string): string {
    return value.replace(/\D/g, "");
  }

  function parseDateValue(dateStr: string): Date | null {
    if (!dateStr) return null;
    const normalized = dateStr.trim().replace(/[.\/\s]+/g, "-");
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      const parsed = parseISO(normalized);
      return isValid(parsed) ? parsed : null;
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(normalized)) {
      const [day, month, year] = normalized.split("-").map(Number);
      const parsed = new Date(year, month - 1, day);
      return isValid(parsed) ? parsed : null;
    }
    const parsed = new Date(dateStr);
    return isValid(parsed) ? parsed : null;
  }

  function formatDateForDisplay(dateStr: string): Date | null {
    return parseDateValue(dateStr);
  }

  function formatDateForCreateApi(date: Date | null): string {
    return date ? format(date, "yyyy-MM-dd") : "";
  }

  function handleAmountChange(value: string) {
    setFormError(""); 
    setFormAmount(normalizeAmountInput(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    // 1. Validasi Tanggal
    const apiDate = formatDateForCreateApi(formDate);
    if (!apiDate) {
      setFormError("Tanggal tidak boleh kosong.");
      return;
    }

    // 2. Ambil nilai kategori langsung dari elemen select DOM untuk menghindari delay/asynchronous state mismatch
    const formElement = e.currentTarget as HTMLFormElement;
    const selectEl = formElement.elements.namedItem("trxCategory") as HTMLSelectElement | null;
    const currentCategoryId = selectEl ? selectEl.value : selectedCategoryId;
    const targetCategoryId = String(currentCategoryId || "").trim();

    if (!targetCategoryId || targetCategoryId === "" || targetCategoryId === "undefined") {
      setFormError("Kategori harus dipilih");
      return;
    }

    // 3. Validasi Kendaraan Opsional
    if (showVehicleDropdown && !selectedVehicleId) {
      setFormError("Kendaraan harus dipilih");
      return;
    }

    // 4. Validasi Nominal Angka
    const amountText = String(formAmount ?? "").trim();
    if (!/^\d+$/.test(amountText)) {
      setFormError("Nominal harus berupa angka bulat");
      return;
    }

    const amountNumber = Number(amountText);
    if (amountNumber <= 0) {
      setFormError("Nominal harus lebih dari 0");
      return;
    }

    // 5. Validasi Catatan
    const noteStr = (formNote || "").trim();
    if (!noteStr) {
      setFormError("Catatan tidak boleh kosong");
      return;
    }

    const authHeader = getAuthHeaderValue(token);
    if (!authHeader) {
      setFormError("Sesi login berakhir, silakan login kembali");
      return;
    }

    setIsSubmitting(true);
    if (editingIndex != null) {
      if (!editingTransactionId) {
        setFormError("ID transaksi tidak ditemukan");
        setIsSubmitting(false);
        return;
      }

      try {
        const response = await fetch(`/api/transactions/${editingTransactionId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader
          },
          body: JSON.stringify({
            amount: amountNumber,
            category: formCategoryType === "income" ? "in" : "out",
            category_id: targetCategoryId,
            transaction_date: apiDate,
            note: noteStr
          })
        });

        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.success) {
          setFormError(data?.server_message ?? data?.detail ?? "Gagal mengubah transaksi");
          return;
        }

        await loadTransactions(currentPage);
        setHighlightedTransactionId(editingTransactionId);
      } catch {
        setFormError("Gagal mengubah transaksi");
        return;
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        const createBody: Record<string, unknown> = {
          amount: amountNumber,
          category_id: targetCategoryId,
          unit: 1,
          transaction_date: apiDate,
          note: noteStr
        };

        if (selectedVehicleId) {
          createBody.vehicle_id = selectedVehicleId;
        }

        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader
          },
          body: JSON.stringify(createBody)
        });

        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.success) {
          setFormError(data?.server_message ?? "Gagal menyimpan transaksi");
          return;
        }

        setCurrentPage(1);
        await loadTransactions(1);
        if (data.id) setHighlightedTransactionId(data.id);
      } catch {
        setFormError("Gagal menyimpan transaksi");
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    clearForm();
    setIsAdding(false);
  }

  function handleCancelEdit() {
    clearForm();
    setIsAdding(false);
  }

  function goToPrevPage() {
    if (currentPage > 1 && !isLoadingTransactions) {
      setCurrentPage((prev) => prev - 1);
    }
  }

  function goToNextPage() {
    if (currentPage < totalPages && !isLoadingTransactions) {
      setCurrentPage((prev) => prev + 1);
    }
  }

  function buildPaginationItems(page: number, pages: number): PaginationItem[] {
    if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
    const items: PaginationItem[] = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(pages - 1, page + 1);
    if (start > 2) items.push("ellipsis");
    for (let value = start; value <= end; value += 1) items.push(value);
    if (end < pages - 1) items.push("ellipsis");
    items.push(pages);
    return items;
  }

  const paginationItems = buildPaginationItems(currentPage, totalPages);

  return (
    <div className="page-shell">
      <Sidebar active="transactions" />

      <main className="main-content">
        <header className="page-head">
          <div>
            <p className="eyebrow">Intelijen Keuangan</p>
            <h1>Manajemen Transaksi</h1>
            <p className="subtitle">Input dan kelola pemasukan/pengeluaran secara terstruktur.</p>
          </div>
          <div className="head-actions">
            <a className="btn-primary" href="/transactions/import">Impor Data</a>
            {!isAdding && (
              <button className="btn-primary" type="button" onClick={openAdd}>
                + Tambah Transaksi
              </button>
            )}
          </div>
        </header>

        <section className="transaction-grid">
          {isAdding && (
            <article className="panel quick-entry">
              <h3 id="entryTitle">{editingIndex != null ? "Ubah Transaksi" : "Tambah Transaksi"}</h3>
              <form className="entry-form" onSubmit={handleSubmit} noValidate>
                <label htmlFor="trxDate">Tanggal Transaksi</label>
                <DatePicker
                  id="trxDate"
                  selected={formDate}
                  onChange={(date: Date | null) => {
                    setFormError(""); 
                    setFormDate(date);
                  }}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="date-picker-input"
                  wrapperClassName="date-picker-wrapper"
                  autoComplete="off"
                  required
                />

                <label htmlFor="trxCategory">Kategori</label>
                <div className="relative">
                  <select
                    id="trxCategory"
                    name="trxCategory"
                    value={selectedCategoryId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setFormError(""); 
                      const val = e.target.value;
                      setSelectedCategoryId(val);
                      
                      const selected = categories.find((cat) => String(cat.id) === String(val));
                      if (selected) {
                        setFormCategoryType(selected.type === "in" ? "income" : "expense");
                      } else {
                        setFormCategoryType("");
                      }
                    }}
                    className="appearance-none pr-12 w-full"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.type === "in" ? "Pendapatan" : "Pengeluaran"})
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#405179]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M7 10l5 5 5-5z" fill="currentColor" />
                  </svg>
                </div>

                {editingIndex != null && !selectedCategoryId && formCategoryType && (
                  <p className="text-sm text-slate-500 mt-2">Kategori saat ini: {formCategoryType === "income" ? "Pendapatan" : "Pengeluaran"}</p>
                )}

                {showVehicleDropdown && (
                  <>
                    <label htmlFor="trxVehicle">Kendaraan</label>
                    <div className="relative">
                      <select
                        id="trxVehicle"
                        name="trxVehicle"
                        value={selectedVehicleId}
                        onChange={(e) => {
                          setFormError(""); 
                          setSelectedVehicleId(e.target.value);
                        }}
                        className="appearance-none pr-12 w-full"
                      >
                        <option value="">Pilih kendaraan</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.plat_nomor} - {vehicle.merek} {vehicle.model} ({vehicle.tahun})
                          </option>
                        ))}
                      </select>
                      <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#405179]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M7 10l5 5 5-5z" fill="currentColor" />
                      </svg>
                    </div>
                  </>
                )}

                <label htmlFor="trxAmount">Nominal (Rupiah)</label>
                <input
                  id="trxAmount"
                  name="trxAmount"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9.]*"
                  placeholder="0"
                  required
                  value={formatAmountInput(formAmount)}
                  onChange={(e) => handleAmountChange(e.target.value)}
                />

                <label htmlFor="trxNote">Catatan</label>
                <textarea 
                  id="trxNote" 
                  name="trxNote" 
                  rows={4} 
                  placeholder="Contoh: Pembayaran sewa kantor" 
                  value={formNote} 
                  onChange={(e) => {
                    setFormError(""); 
                    setFormNote(e.target.value);
                  }} 
                />

                {formError && <p className="text-sm text-red-600 font-semibold">{formError}</p>}

                <button type="submit" className="btn-primary btn-full" id="submitEntryBtn">
                  {isSubmitting ? "Menyimpan..." : editingIndex != null ? "Simpan Perubahan" : "Simpan Transaksi"}
                </button>
                <button type="button" className="btn-ghost btn-full btn-cancel-edit" id="cancelEditBtn" onClick={handleCancelEdit}>
                  Batal
                </button>
              </form>
            </article>
          )}

          <article className={`panel ledger ${!isAdding ? 'full-ledger' : ''}`}>
            <div className="ledger-head">
              <div>
                <h3>Daftar Transaksi</h3>
                <p className="ledger-summary">Total transaksi: {totalItems}</p>
              </div>
            </div>
            <div className="table-wrap">
              <table id="transactionTable">
                <thead>
                  <tr>
                    <th className="col-header-number">No.</th>
                    <th>Tanggal</th>
                    <th>Kategori</th>
                    <th>Catatan</th>
                    <th>Nominal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <TransactionTable transactions={transactions} onEdit={handleEdit} onDelete={handleDelete} editingIndex={editingIndex} pageNumber={currentPage} pageSize={pageSize} highlightedId={highlightedTransactionId} isLoading={isLoadingTransactions} />
              </table>
            </div>
            <div className="pagination-bar" aria-live="polite">
              <nav className="pagination-controls" aria-label="Navigasi halaman transaksi">
                <button
                  type="button"
                  className="pager-btn pager-arrow"
                  onClick={goToPrevPage}
                  disabled={currentPage <= 1 || isLoadingTransactions}
                >
                  ‹
                </button>

                <div className="pager-list">
                  {paginationItems.map((item, index) => {
                    if (item === "ellipsis") {
                      return <span className="pager-ellipsis" key={`ellipsis-${index}`}>...</span>;
                    }
                    return (
                      <button
                        key={`page-${item}`}
                        type="button"
                        className={`pager-btn pager-number ${item === currentPage ? "is-active" : ""}`}
                        onClick={() => setCurrentPage(item)}
                        disabled={isLoadingTransactions}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="pager-btn pager-arrow"
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages || isLoadingTransactions}
                >
                  ›
                </button>
              </nav>
            </div>
          </article>
        </section>
      </main>

      <div className="modal-backdrop" id="deleteModal" hidden={pendingDeleteIndex == null}>
        <div className="modal-card" role="dialog" aria-modal="true">
          <h3>Konfirmasi Hapus</h3>
          <p>Yakin ingin menghapus transaksi ini?</p>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={cancelDelete} disabled={isDeletingTransaction}>
              Tidak
            </button>
            <button type="button" className={`btn-danger ${isDeletingTransaction ? 'is-loading' : ''}`} onClick={confirmDelete} disabled={isDeletingTransaction}>
              {isDeletingTransaction ? 'Menghapus...' : 'Ya'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}