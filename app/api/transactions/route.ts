import { NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.FINANCE_API_BASE_URL ?? 'https://fin-management-backend.orangewave-4f1698d3.eastasia.azurecontainerapps.io';
const BACKEND_BEARER_TOKEN = process.env.FINANCE_API_BEARER_TOKEN ?? 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwidXNlcl9pZCI6IjBlMDAwMDcxLTRlYTMtNGUyMy05MzhmLWI4Y2RlZmQ0ODliZSIsInJvbGUiOiJzdGFmZiIsImV4cCI6MTc3ODIxNzcwMH0.ncqllj1oUqLjzWNowiW_AhMzuYgPEBJ3o2Y40vDLNp8';

type BackendTransaction = {
  id: string;
  amount: number;
  category: 'in' | 'out';
  transaction_date: string;
  note: string;
};

type UiTransaction = {
  date: string;
  category: 'income' | 'expense';
  note: string;
  amount: number;
};

function mapTransaction(transaction: BackendTransaction): UiTransaction {
  return {
    date: transaction.transaction_date,
    category: transaction.category === 'in' ? 'income' : 'expense',
    note: transaction.note,
    amount: Math.abs(transaction.amount)
  };
}

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/transactions?page=1&limit=10`, {
      headers: {
        Authorization: BACKEND_BEARER_TOKEN
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json([], { status: response.status });
    }

    const data: { items?: BackendTransaction[] } = await response.json();
    return NextResponse.json((data.items ?? []).map(mapTransaction));
  } catch (error) {
    console.error('Failed to load transactions', error);
    return NextResponse.json([]);
  }
}
