import { NextResponse } from 'next/server';
import { BACKEND_BASE_URL, BACKEND_BEARER_TOKEN } from '@/lib/backend';

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
        Authorization: `Bearer ${BACKEND_BEARER_TOKEN}`,
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
