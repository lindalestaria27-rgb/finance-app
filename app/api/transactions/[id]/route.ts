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

function convertDateToBackendFormat(isoDate: string): string {
  // Convert YYYY-MM-DD to DD-MM-YYYY
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return isoDate;
}

function parseToIso(dateStr: string): string | null {
  if (!dateStr) return null;
  dateStr = dateStr.trim();
  const normalized = dateStr.replace(/[\.\/\s]+/g, '-');
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;
  if (/^\d{2}-\d{2}-\d{4}$/.test(normalized)) {
    const [d, m, y] = normalized.split('-');
    return `${y}-${m}-${d}`;
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return null;
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

function validateAndFormatUpdateTransaction(payload: UpdateTransactionPayload): {
  valid: boolean;
  error?: string;
  data?: {
    amount: number;
    category: 'in' | 'out';
    note: string;
    transaction_date: string;
  };
} {
  const isoDate = parseToIso(payload.transaction_date);

  if (!isoDate || !validateDateFormat(isoDate)) {
    return {
      valid: false,
      error: 'Format transaction_date tidak valid, harus DD-MM-YYYY (contoh: 02-02-2000)'
    };
  }

  if (payload.amount <= 0) {
    return {
      valid: false,
      error: 'Nominal harus lebih dari 0'
    };
  }

  const noteStr = (payload.note || '').trim();
  if (!noteStr) {
    return {
      valid: false,
      error: 'Catatan tidak boleh kosong'
    };
  }

  // Convert to backend format DD-MM-YYYY
  const backendDate = convertDateToBackendFormat(isoDate);

  return {
    valid: true,
    data: {
      amount: payload.amount,
      category: payload.category,
      note: noteStr,
      transaction_date: backendDate
    }
  };
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

    // Validate and format transaction for UPDATE
    const validation = validateAndFormatUpdateTransaction(payload);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          server_message: validation.error
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
      body: JSON.stringify(validation.data),
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
