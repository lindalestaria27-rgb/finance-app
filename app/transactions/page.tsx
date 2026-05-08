"use client";

import React, { useEffect, useRef, useState } from "react";
import TransactionTable, { Transaction } from "./TransactionTable";
import Sidebar from "../components/Sidebar";
import "./transactions.css";

export default function TransactionsPage() {
	 const [transactions, setTransactions] = useState<Transaction[]>([]);
	 const [editingIndex, setEditingIndex] = useState<number | null>(null);
	 const [isAdding, setIsAdding] = useState(false);
	 const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [formError, setFormError] = useState("");

	 const dateRef = useRef<HTMLInputElement | null>(null);

	 const [formDate, setFormDate] = useState("");
	 const [formCategory, setFormCategory] = useState<"income" | "expense" | "">("");
	 const [formAmount, setFormAmount] = useState<number | string>("");
	 const [formNote, setFormNote] = useState("");

   async function loadTransactions() {
     try {
       const response = await fetch("/api/transactions", { cache: "no-store" });
       const data = (await response.json()) as Transaction[];
       setTransactions(data);
     } catch {
       setTransactions([]);
     }
   }

   useEffect(() => {
     void loadTransactions();
   }, []);

	 function clearForm() {
		 setFormDate("");
		 setFormCategory("");
		 setFormAmount("");
		 setFormNote("");
     setFormError("");
		 setEditingIndex(null);
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
		 setTransactions((prev) => prev.filter((_, i) => i !== pendingDeleteIndex));
		 setPendingDeleteIndex(null);
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
			 setTransactions((prev) => {
				 const copy = [...prev];
				 copy[editingIndex] = { date: formDate, category: formCategory as Transaction["category"], note: formNote, amount: amountNumber };
				 return copy;
			 });
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

         setTransactions((prev) => [
           {
             id: data.id,
             date: data.transaction_date ?? formDate,
             category: data.category === "in" ? "income" : "expense",
             note: data.note ?? formNote,
             amount: Math.abs(Number(data.amount ?? amountNumber))
           },
           ...prev
         ]);
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
              <h3>Daftar Transaksi</h3>
            </div>
            <div className="table-wrap">
              <table id="transactionTable">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Kategori</th>
                    <th>Catatan</th>
                    <th>Nominal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <TransactionTable transactions={transactions} onEdit={handleEdit} onDelete={handleDelete} editingIndex={editingIndex} />
              </table>
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
 