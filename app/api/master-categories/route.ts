import { NextResponse } from 'next/server';
import { BACKEND_BASE_URL } from '@/lib/backend';

function resolveAuthorizationHeader(request: Request): string | null {
  const incomingHeader = request.headers.get('authorization')?.trim();
  if (!incomingHeader) return null;
  return incomingHeader.toLowerCase().startsWith('bearer ')
    ? incomingHeader
    : `Bearer ${incomingHeader}`;
}

type CreateCategoryPayload = {
  name: string;
  type: 'in' | 'out';
};

export async function GET(request: Request) {
  try {
    const authHeader = resolveAuthorizationHeader(request);
    if (!authHeader) {
      return NextResponse.json({ success: false, server_message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_BASE_URL}/master-categories`, {
      headers: {
        Authorization: authHeader
      },
      cache: 'no-store'
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data ?? { success: false, server_message: 'Backend response tidak valid' }, {
      status: response.ok ? 200 : response.status
    });
  } catch (error) {
    console.error('Failed to fetch master categories', error);
    return NextResponse.json({ success: false, server_message: 'Gagal memuat kategori' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = resolveAuthorizationHeader(request);
    if (!authHeader) {
      return NextResponse.json({ success: false, server_message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as CreateCategoryPayload;
    const name = String(body.name ?? '').trim();
    const type = body.type === 'in' || body.type === 'out' ? body.type : null;

    if (!name || !type) {
      return NextResponse.json({ success: false, server_message: 'Nama dan tipe kategori harus diisi' }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_BASE_URL}/master-categories`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, type }),
      cache: 'no-store'
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data ?? { success: false, server_message: 'Backend response tidak valid' }, {
      status: response.ok ? 200 : response.status
    });
  } catch (error) {
    console.error('Failed to create master category', error);
    return NextResponse.json({ success: false, server_message: 'Gagal membuat kategori' }, { status: 500 });
  }
}
