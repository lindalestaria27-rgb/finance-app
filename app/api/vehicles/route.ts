import { NextResponse } from 'next/server';
import { BACKEND_BASE_URL } from '@/lib/backend';

function resolveAuthorizationHeader(request: Request): string | null {
  const incomingHeader = request.headers.get('authorization')?.trim();
  if (!incomingHeader) return null;
  return incomingHeader.toLowerCase().startsWith('bearer ')
    ? incomingHeader
    : `Bearer ${incomingHeader}`;
}

export async function GET(request: Request) {
  try {
    const authHeader = resolveAuthorizationHeader(request);
    if (!authHeader) {
      return NextResponse.json({ success: false, server_message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_BASE_URL}/vehicles`, {
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
    console.error('Failed to fetch vehicles', error);
    return NextResponse.json({ success: false, server_message: 'Gagal memuat kendaraan' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = resolveAuthorizationHeader(request);
    if (!authHeader) {
      return NextResponse.json({ success: false, server_message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    const response = await fetch(`${BACKEND_BASE_URL}/vehicles`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data ?? { success: false, server_message: 'Backend response tidak valid' }, {
      status: response.ok ? 200 : response.status
    });
  } catch (error) {
    console.error('Failed to create vehicle', error);
    return NextResponse.json({ success: false, server_message: 'Gagal membuat kendaraan' }, { status: 500 });
  }
}
