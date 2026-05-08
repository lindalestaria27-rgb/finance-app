import { NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.FINANCE_API_BASE_URL ?? 'https://fin-management-backend.orangewave-4f1698d3.eastasia.azurecontainerapps.io';

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

type BackendTransactionsListResponse = {
  items?: BackendTransaction[];
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    total_pages?: number;
  };
};

type TransactionsListResponse = {
  items: UiTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
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

function validateDateFormat(isoDate: string): boolean {
  // Validate YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(isoDate);
}

function resolveAuthorizationHeader(request: Request): string | null {
  const incomingHeader = request.headers.get('authorization')?.trim();
  if (!incomingHeader) {
    return null;
  }

  return incomingHeader.toLowerCase().startsWith('bearer ')
    ? incomingHeader
    : `Bearer ${incomingHeader}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 10) || 10));

    const authHeader = resolveAuthorizationHeader(request);
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_BASE_URL}/transactions?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: authHeader
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Backend transactions fetch failed with status', response.status);
      return NextResponse.json(
        {
          items: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 1,
            hasPrev: false,
            hasNext: false
          }
        } satisfies TransactionsListResponse,
        { status: response.status }
      );
    }

    const data = (await response.json()) as BackendTransactionsListResponse;

    const rawPage = data.pagination?.page ?? data.page ?? page;
    const rawLimit = data.pagination?.limit ?? data.limit ?? limit;
    const rawTotal = data.pagination?.total ?? data.total ?? 0;
    const rawTotalPages = data.pagination?.total_pages ?? data.total_pages ?? Math.max(1, Math.ceil(rawTotal / Math.max(1, rawLimit)));

    const normalizedPage = Math.max(1, Number(rawPage) || 1);
    const normalizedLimit = Math.max(1, Number(rawLimit) || limit);
    const normalizedTotal = Math.max(0, Number(rawTotal) || 0);
    const normalizedTotalPages = Math.max(1, Number(rawTotalPages) || 1);

    return NextResponse.json({
      items: (data.items ?? []).map(mapTransaction),
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total: normalizedTotal,
        totalPages: normalizedTotalPages,
        hasPrev: normalizedPage > 1,
        hasNext: normalizedPage < normalizedTotalPages
      }
    } satisfies TransactionsListResponse);
  } catch (error) {
    console.error('Failed to load transactions', error);
    return NextResponse.json({
      items: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasPrev: false,
        hasNext: false
      }
    } satisfies TransactionsListResponse);
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

    if (!payload.transaction_date || !validateDateFormat(payload.transaction_date) || !payload.note || payload.amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          server_message: 'Data transaksi tidak valid'
        } satisfies BackendCreateTransactionResponse,
        { status: 400 }
      );
    }

    const authHeader = resolveAuthorizationHeader(request);
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          server_message: 'Unauthorized'
        } satisfies BackendCreateTransactionResponse,
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
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
