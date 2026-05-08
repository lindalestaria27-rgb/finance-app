import React from 'react';

export interface Transaction {
  id?: string;
  date: string;
  category: 'income' | 'expense';
  note: string;
  amount: number;
}

interface Props {
  transactions: Transaction[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  editingIndex: number | null;
  pageNumber?: number;
  pageSize?: number;
}

function formatDisplayDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-');
  const monthMap: Record<string, string> = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'Mei', '06': 'Jun',
    '07': 'Jul', '08': 'Agu', '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des',
  };
  return `${day} ${monthMap[month] || month} ${year}`;
}

function formatIdr(value: number) {
  return value.toLocaleString('id-ID');
}

export default function TransactionTable({ transactions, onEdit, onDelete, editingIndex, pageNumber = 1, pageSize = 10 }: Props) {
  return (
    <tbody>
      {transactions.map((trx, idx) => {
        const rowNumber = (pageNumber - 1) * pageSize + idx + 1;
        const isIncome = trx.category === 'income';
        const displayAmount = Math.abs(trx.amount);
        return (
          <tr key={trx.id ?? `${trx.date}-${idx}`} className={editingIndex === idx ? 'is-editing' : ''} data-date={trx.date} data-category={trx.category} data-note={trx.note} data-amount={trx.amount}>
            <td className="col-number">{rowNumber}</td>
            <td>{formatDisplayDate(trx.date)}</td>
            <td><span className={`tag ${isIncome ? 'in' : 'out'}`}>{isIncome ? 'Pendapatan' : 'Pengeluaran'}</span></td>
            <td>{trx.note}</td>
            <td className={`amount ${isIncome ? 'pos' : 'neg'}`}>{isIncome ? '+Rp' : '-Rp'}{formatIdr(displayAmount)}</td>
            <td className="actions">
              <button type="button" className="edit-btn" onClick={() => onEdit(idx)}>Ubah</button>
              <button type="button" className="danger delete-btn" onClick={() => onDelete(idx)}>Hapus</button>
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}
