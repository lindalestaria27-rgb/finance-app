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

   // Auto-clear highlight after 2 seconds
   useEffect(() => {
     if (!highlightedTransactionId) return;
     const timer = setTimeout(() => setHighlightedTransactionId(null), 2000);
     return () => clearTimeout(timer);
   }, [highlightedTransactionId]);

   const [formDate, setFormDate] = useState<Date | null>(null);
	 const [formCategory, setFormCategory] = useState<"income" | "expense" | "">("");
   const [formAmount, setFormAmount] = useState<string>("");
	 const [formNote, setFormNote] = useState("");
	 const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

   function getAuthHeaderValue(currentToken: string | null): string | null {
     if (!currentToken) {
       return null;
     }

     return currentToken.toLowerCase().startsWith("bearer ")
       ? currentToken
       : `Bearer ${currentToken}`;
   }

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
     if (isAuthLoading) {
       return;
     }

     void loadTransactions(currentPage);
   }, [isAuthLoading, token, currentPage, pageSize]);

	 function clearForm() {
     setFormDate(null);
		 setFormCategory("");
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
		 setFormCategory(t.category);
     setFormAmount(String(t.amount));
		 setFormNote(t.note);
	 }

	 function handleDelete(index: number) {
		 setPendingDeleteIndex(index);
	 }

	 function confirmDelete() {
		 if (pendingDeleteIndex == null) return;
		 const transactionToDelete = transactions[pendingDeleteIndex];
		 
		 if (!transactionToDelete.id) {
		   alert("ID transaksi tidak ditemukan");
		   setPendingDeleteIndex(null);
		   return;
		 }

		 const authHeader = getAuthHeaderValue(token);
		 if (!authHeader) {
		   alert("Sesi login tidak ditemukan, silakan login ulang");
		   setPendingDeleteIndex(null);
		   return;
		 }

		 setIsDeletingTransaction(true);
     fetch(`/api/transactions/${transactionToDelete.id}`, {
       method: "DELETE",
       headers: {
         "Content-Type": "application/json",
         Authorization: authHeader
       }
     })
		   .then(async (response) => {
		     const data = (await response.json().catch(() => null)) as
		       | {
		           success?: boolean;
		           server_message?: string;
		           detail?: string;
		         }
		       | null;

		     if (!response.ok || !data?.success) {
		       alert(data?.server_message ?? data?.detail ?? "Gagal menghapus transaksi");
		       return;
		     }

		     await loadTransactions(currentPage);
		     setPendingDeleteIndex(null);
		   })
		   .catch(() => {
		     alert("Gagal menghapus transaksi");
		   })
		   .finally(() => {
		     setIsDeletingTransaction(false);
		   });
	 }

  function cancelDelete() {
    setPendingDeleteIndex(null);
  }

  function formatIdr(value: number) {
    return value.toLocaleString("id-ID");
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
    // CREATE: convert to YYYY-MM-DD for backend
    return date ? format(date, "yyyy-MM-dd") : "";
  }

  function formatDateForEditApi(date: Date | null): string {
    // EDIT: convert to DD-MM-YYYY for backend
    return date ? format(date, "dd-MM-yyyy") : "";
  }

  function handleAmountChange(value: string) {
    setFormAmount(normalizeAmountInput(value));
  }

   async function handleSubmit(e: React.FormEvent) {
		 e.preventDefault();
     setFormError("");

     // Validate date
     // Use different date format for CREATE vs EDIT
     const apiDate = editingIndex != null 
       ? formatDateForEditApi(formDate)
       : formatDateForCreateApi(formDate);
     
     if (!apiDate) {
       const formatHint = editingIndex != null ? "DD-MM-YYYY" : "YYYY-MM-DD";
       setFormError(`Tanggal tidak boleh kosong. Format: ${formatHint}`);
       return;
     }

     // Validate category
     if (!formCategory) {
       setFormError("Kategori harus dipilih (Pendapatan atau Pengeluaran)");
       return;
     }

     // Validate amount
     const amountText = String(formAmount ?? "").trim();
     if (!/^[0-9]+$/.test(amountText)) {
       setFormError("Nominal harus berupa angka bulat tanpa karakter lain");
       return;
     }

     const amountNumber = Number(amountText);
     if (amountNumber <= 0) {
       setFormError("Nominal harus lebih dari 0");
       return;
     }

     // Validate note
     const noteStr = (formNote || "").trim();
     if (!noteStr) {
       setFormError("Catatan tidak boleh kosong");
       return;
     }

		 if (editingIndex != null) {
       const authHeader = getAuthHeaderValue(token);
       if (!authHeader) {
         setFormError("Sesi login tidak ditemukan, silakan login ulang");
         return;
       }

       if (!editingTransactionId) {
         setFormError("ID transaksi tidak ditemukan");
         return;
       }

       setIsSubmitting(true);
       try {
         const response = await fetch(`/api/transactions/${editingTransactionId}`, {
           method: "PATCH",
           headers: {
             "Content-Type": "application/json",
             Authorization: authHeader
           },
           body: JSON.stringify({
             amount: amountNumber,
             category: formCategory === "income" ? "in" : "out",
             transaction_date: apiDate,
             note: noteStr
           })
         });

         const data = (await response.json().catch(() => null)) as
           | {
             success?: boolean;
             server_message?: string;
             detail?: string;
             id?: string;
             amount?: number;
             category?: "in" | "out";
             transaction_date?: string;
             note?: string;
           }
           | null;

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
  		 const authHeader = getAuthHeaderValue(token);
  		 if (!authHeader) {
  		   setFormError("Sesi login tidak ditemukan, silakan login ulang");
  		   return;
  		 }

       setIsSubmitting(true);
       try {
         const response = await fetch("/api/transactions", {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
               Authorization: authHeader
           },
           body: JSON.stringify({
             amount: amountNumber,
             category: formCategory === "income" ? "in" : "out",
             transaction_date: apiDate,
             note: noteStr
           })
         });

         const data = (await response.json().catch(() => null)) as
           | {
             success?: boolean;
             server_message?: string;
             id?: string;
             amount?: number;
             category?: "in" | "out";
             transaction_date?: string;
             note?: string;
           }
           | null;

         if (!response.ok || !data?.success) {
           setFormError(data?.server_message ?? "Gagal menyimpan transaksi");
           return;
         }

         setCurrentPage(1);
         await loadTransactions(1);
         if (data.id) {
           setHighlightedTransactionId(data.id);
         }
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
    if (pages <= 7) {
      return Array.from({ length: pages }, (_, index) => index + 1);
    }

    const items: PaginationItem[] = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(pages - 1, page + 1);

    if (start > 2) {
      items.push("ellipsis");
    }

    for (let value = start; value <= end; value += 1) {
      items.push(value);
    }

    if (end < pages - 1) {
      items.push("ellipsis");
    }

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
            <a className="btn-primary" href="/transactions-import">
              Impor Data
            </a>
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
              <form className="entry-form" onSubmit={handleSubmit}>
                <label htmlFor="trxDate">Tanggal Transaksi</label>
                <DatePicker
                  id="trxDate"
                  selected={formDate}
                  onChange={(date: Date | null) => setFormDate(date)}
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
                    required
                    value={formCategory}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormCategory(e.currentTarget.value as "income" | "expense" | "")}
                    className="appearance-none pr-12 w-full"
                  >
                  <option value="">Pilih kategori</option>
                  <option value="income">Pendapatan</option>
                  <option value="expense">Pengeluaran</option>
                  </select>
                  <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#405179]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M7 10l5 5 5-5z" fill="currentColor" />
                  </svg>
                </div>

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
                <textarea id="trxNote" name="trxNote" rows={4} placeholder="Contoh: Pembayaran sewa kantor" value={formNote} onChange={(e) => setFormNote(e.target.value)} />

				{formError && <p className="text-sm text-red-600">{formError}</p>}

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
                  aria-label="Halaman sebelumnya"
                >
                  ‹
                </button>

                <div className="pager-list">
                  {paginationItems.map((item, index) => {
                    if (item === "ellipsis") {
                      return (
                        <span className="pager-ellipsis" key={`ellipsis-${index}`} aria-hidden="true">
                          ...
                        </span>
                      );
                    }

                    return (
                      <button
                        key={`page-${item}`}
                        type="button"
                        className={`pager-btn pager-number ${item === currentPage ? "is-active" : ""}`}
                        onClick={() => setCurrentPage(item)}
                        disabled={isLoadingTransactions}
                        aria-current={item === currentPage ? "page" : undefined}
                        aria-label={`Halaman ${item}`}
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
                  aria-label="Halaman berikutnya"
                >
                  ›
                </button>
              </nav>
            </div>
          </article>
        </section>
      </main>

      <div className="modal-backdrop" id="deleteModal" hidden={pendingDeleteIndex == null}>
        <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="deleteModalTitle">
          <h3 id="deleteModalTitle">Konfirmasi Hapus</h3>
          <p>Yakin ingin menghapus transaksi ini?</p>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" id="deleteNoBtn" onClick={cancelDelete} disabled={isDeletingTransaction}>
              Tidak
            </button>
            <button type="button" className={`btn-danger ${isDeletingTransaction ? 'is-loading' : ''}`} id="deleteYesBtn" onClick={confirmDelete} disabled={isDeletingTransaction}>
              {isDeletingTransaction ? (
                <>
                  <span className="spinner"></span>
                  Menghapus...
                </>
              ) : (
                'Ya'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
 