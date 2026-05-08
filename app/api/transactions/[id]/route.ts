import { NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.FINANCE_API_BASE_URL ?? 'https://fin-management-backend.orangewave-4f1698d3.eastasia.azurecontainerapps.io';

type UpdateTransactionPayload = {
  amount: number;
  category: 'in' | 'out';
  transaction_date: string;
  note: string;
};

type BackendUpdateTransactionResponse = {
  success?: boolean;
  server_message?: string;
  detail?: string;
  id?: string;
  amount?: number;
  category?: 'in' | 'out';
  transaction_date?: string;
  note?: string;
  organization_id?: string;
  created_at?: string;
};

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = (await request.json()) as Partial<UpdateTransactionPayload> & {
      category?: 'in' | 'out' | 'income' | 'expense';
    };

    const payload: UpdateTransactionPayload = {
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
        } satisfies BackendUpdateTransactionResponse,
        { status: 400 }
      );
    }

    const authHeader = resolveAuthorizationHeader(request);
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          server_message: 'Unauthorized'
        } satisfies BackendUpdateTransactionResponse,
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_BASE_URL}/transactions/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    const data = (await response.json().catch(() => null)) as BackendUpdateTransactionResponse | null;

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          server_message: 'Backend response tidak valid'
        } satisfies BackendUpdateTransactionResponse,
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Failed to update transaction', error);
    return NextResponse.json(
      {
        success: false,
        server_message: 'Gagal mengubah transaksi'
      } satisfies BackendUpdateTransactionResponse,
      { status: 500 }
    );
  }
}

type BackendDeleteTransactionResponse = {
  success?: boolean;
  server_message?: string;
  detail?: string;
  message?: string;
  deleted_at?: string;
};

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = resolveAuthorizationHeader(request);
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          server_message: 'Unauthorized'
        } satisfies BackendDeleteTransactionResponse,
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: authHeader
      },
      cache: 'no-store'
    });

    const data = (await response.json().catch(() => null)) as BackendDeleteTransactionResponse | null;

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          server_message: 'Backend response tidak valid'
        } satisfies BackendDeleteTransactionResponse,
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Failed to delete transaction', error);
    return NextResponse.json(
      {
        success: false,
        server_message: 'Gagal menghapus transaksi'
      } satisfies BackendDeleteTransactionResponse,
      { status: 500 }
    );
  }
}
