import { NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.FINANCE_API_BASE_URL ?? 'https://fin-management-backend.orangewave-4f1698d3.eastasia.azurecontainerapps.io';
const BACKEND_BEARER_TOKEN = process.env.FINANCE_API_BEARER_TOKEN ?? 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwidXNlcl9pZCI6IjBlMDAwMDcxLTRlYTMtNGUyMy05MzhmLWI4Y2RlZmQ0ODliZSIsInJvbGUiOiJzdGFmZiIsImV4cCI6MTc3ODIyMDk5Nn0.cj3GaegwdVRUkiE6fO1NwNibnAYUd7l0ivT_tEwJJIU';

type BackendTransaction = {
  id: string;
  amount: number;
  category: 'in' | 'out';
  transaction_date: string;
  note: string;
};

type UiTransaction = {
  id?: string;
  date: string;
  category: 'income' | 'expense';
  note: string;
  amount: number;
};

type CreateTransactionPayload = {
  amount: number;
  category: 'in' | 'out';
  transaction_date: string;
  note: string;
};

type BackendCreateTransactionResponse = {
  success: boolean;
  server_message: string;
  id?: string;
  amount?: number;
  category?: 'in' | 'out';
  transaction_date?: string;
  note?: string;
  organization_id?: string;
  created_at?: string;
};

function mapTransaction(transaction: BackendTransaction): UiTransaction {
  return {
    id: transaction.id,
    date: transaction.transaction_date,
    category: transaction.category === 'in' ? 'income' : 'expense',
    note: transaction.note,
    amount: Math.abs(transaction.amount)
  };
}

function normalizeCategory(category: string): 'in' | 'out' {
  return category === 'income' ? 'in' : category === 'expense' ? 'out' : (category as 'in' | 'out');
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
      console.error('Backend transactions fetch failed with status', response.status);
      return NextResponse.json([], { status: response.status });
    }

    const data: { items?: BackendTransaction[] } = await response.json();
    return NextResponse.json((data.items ?? []).map(mapTransaction));
  } catch (error) {
    console.error('Failed to load transactions', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreateTransactionPayload> & {
      category?: 'in' | 'out' | 'income' | 'expense';
    };

    const payload: CreateTransactionPayload = {
      amount: Number(body.amount ?? 0),
      category: normalizeCategory(body.category ?? 'out'),
      transaction_date: body.transaction_date ?? '',
      note: body.note ?? ''
    };

    if (!payload.transaction_date || !payload.note || payload.amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          server_message: 'Data transaksi tidak valid'
        } satisfies BackendCreateTransactionResponse,
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: BACKEND_BEARER_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    const data = (await response.json().catch(() => null)) as BackendCreateTransactionResponse | null;

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          server_message: 'Backend response tidak valid'
        } satisfies BackendCreateTransactionResponse,
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Failed to create transaction', error);
    return NextResponse.json(
      {
        success: false,
        server_message: 'Gagal membuat transaksi'
      } satisfies BackendCreateTransactionResponse,
      { status: 500 }
    );
  }
}
