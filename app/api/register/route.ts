import { NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.FINANCE_API_BASE_URL ?? 'https://fin-management-backend.orangewave-4f1698d3.eastasia.azurecontainerapps.io';
const BACKEND_BEARER_TOKEN = process.env.FINANCE_API_BEARER_TOKEN ?? 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwidXNlcl9pZCI6IjBlMDAwMDcxLTRlYTMtNGUyMy05MzhmLWI4Y2RlZmQ0ODliZSIsInJvbGUiOiJzdGFmZiIsImV4cCI6MTc3ODIyNTUwN30.d5hQs9DLHe7k_8yDFMYLVW6YM275Mb_JP-nIE1RIwCw';

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  role: string;
  organization_id: string;
};

type BackendRegisterResponse = {
  success?: boolean;
  server_message?: string;
  detail?: string;
  id?: string;
  username?: string;
  email?: string;
  role?: string;
  organization_id?: string;
  created_at?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<RegisterPayload>;

    const payload: RegisterPayload = {
      username: String(body.username ?? '').trim(),
      email: String(body.email ?? '').trim(),
      password: String(body.password ?? ''),
      role: String(body.role ?? 'staff'),
      organization_id: String(body.organization_id ?? '')
    };

    // Validation
    if (!payload.username || !payload.email || !payload.password || !payload.organization_id) {
      return NextResponse.json(
        {
          success: false,
          server_message: 'Semua field harus diisi'
        } satisfies BackendRegisterResponse,
        { status: 400 }
      );
    }

    if (!payload.email.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          server_message: 'Email tidak valid'
        } satisfies BackendRegisterResponse,
        { status: 400 }
      );
    }

    if (payload.password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          server_message: 'Kata sandi minimal 6 karakter'
        } satisfies BackendRegisterResponse,
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        Authorization: BACKEND_BEARER_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    const data = (await response.json().catch(() => null)) as BackendRegisterResponse | null;

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          server_message: 'Backend response tidak valid'
        } satisfies BackendRegisterResponse,
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Failed to register', error);
    return NextResponse.json(
      {
        success: false,
        server_message: 'Gagal mendaftar akun'
      } satisfies BackendRegisterResponse,
      { status: 500 }
    );
  }
}
