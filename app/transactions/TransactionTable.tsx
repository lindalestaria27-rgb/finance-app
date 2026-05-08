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
  highlightedId?: string | null;
  isLoading?: boolean;
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

export default function TransactionTable({ transactions, onEdit, onDelete, editingIndex, pageNumber = 1, pageSize = 10, highlightedId = null, isLoading = false }: Props) {
  if (isLoading) {
    // Show skeleton loading rows
    return (
      <tbody>
        {Array.from({ length: pageSize }).map((_, idx) => (
          <tr key={`skeleton-${idx}`} className="skeleton-row">
            <td className="col-number"><span className="skeleton skeleton-text"></span></td>
            <td><span className="skeleton skeleton-text"></span></td>
            <td><span className="skeleton skeleton-badge"></span></td>
            <td><span className="skeleton skeleton-text"></span></td>
            <td className="amount"><span className="skeleton skeleton-text"></span></td>
            <td className="actions"><span className="skeleton skeleton-button"></span></td>
          </tr>
        ))}
      </tbody>
    );
  }

  return (
    <tbody>
      {transactions.map((trx, idx) => {
        const rowNumber = (pageNumber - 1) * pageSize + idx + 1;
        const isIncome = trx.category === 'income';
        const displayAmount = Math.abs(trx.amount);
        const isHighlighted = highlightedId && trx.id === highlightedId;
        return (
          <tr key={trx.id ?? `${trx.date}-${idx}`} className={`${editingIndex === idx ? 'is-editing' : ''} ${isHighlighted ? 'is-new' : ''}`.trim()} data-date={trx.date} data-category={trx.category} data-note={trx.note} data-amount={trx.amount}>
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
