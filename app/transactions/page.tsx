"use client";

import React, { useEffect, useRef, useState } from "react";
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

	 const dateRef = useRef<HTMLInputElement | null>(null);

	 const [formDate, setFormDate] = useState("");
	 const [formCategory, setFormCategory] = useState<"income" | "expense" | "">("");
	 const [formAmount, setFormAmount] = useState<number | string>("");
	 const [formNote, setFormNote] = useState("");
	 const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

   async function loadTransactions(page: number) {
     try {
       setIsLoadingTransactions(true);
       const response = await fetch(`/api/transactions?page=${page}&limit=${pageSize}`, { cache: "no-store" });
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
     void loadTransactions(currentPage);
   }, [currentPage]);

	 function clearForm() {
		 setFormDate("");
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
		 setTimeout(() => dateRef.current?.focus(), 50);
	 }

	 function handleEdit(index: number) {
		 const t = transactions[index];
		 setEditingIndex(index);
		 setIsAdding(true);
		 setEditingTransactionId(t.id ?? null);
		 setFormDate(t.date);
		 setFormCategory(t.category);
		 setFormAmount(t.amount);
		 setFormNote(t.note);
		 setTimeout(() => dateRef.current?.focus(), 50);
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

		 setIsDeletingTransaction(true);
		 fetch(`/api/transactions/${transactionToDelete.id}`, {
		   method: "DELETE",
		   headers: {
		     "Content-Type": "application/json"
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
   async function handleSubmit(e: React.FormEvent) {
		 e.preventDefault();
		 const amountNumber = Math.max(0, Math.round(Number(formAmount || 0)));
     setFormError("");

		 if (editingIndex != null) {
       if (!editingTransactionId) {
         setFormError("ID transaksi tidak ditemukan");
         return;
       }

       setIsSubmitting(true);
       try {
         const response = await fetch(`/api/transactions/${editingTransactionId}`, {
           method: "PATCH",
           headers: {
             "Content-Type": "application/json"
           },
           body: JSON.stringify({
             amount: amountNumber,
             category: formCategory === "income" ? "in" : "out",
             transaction_date: formDate,
             note: formNote
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
       } catch {
         setFormError("Gagal mengubah transaksi");
         return;
       } finally {
         setIsSubmitting(false);
       }
		 } else {
       setIsSubmitting(true);
       try {
         const response = await fetch("/api/transactions", {
           method: "POST",
           headers: {
             "Content-Type": "application/json"
           },
           body: JSON.stringify({
             amount: amountNumber,
             category: formCategory === "income" ? "in" : "out",
             transaction_date: formDate,
             note: formNote
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
                <input ref={dateRef} id="trxDate" name="trxDate" type="date" required value={formDate} onChange={(e) => setFormDate(e.target.value)} />

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
                <input id="trxAmount" name="trxAmount" type="number" min="1" step="1" placeholder="0" required value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />

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
                <TransactionTable transactions={transactions} onEdit={handleEdit} onDelete={handleDelete} editingIndex={editingIndex} pageNumber={currentPage} pageSize={pageSize} />
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
            <button type="button" className="btn-ghost" id="deleteNoBtn" onClick={cancelDelete}>
              Tidak
            </button>
            <button type="button" className="btn-danger" id="deleteYesBtn" onClick={confirmDelete}>
              Ya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
 