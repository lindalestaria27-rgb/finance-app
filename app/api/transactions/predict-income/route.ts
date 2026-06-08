import { NextResponse } from 'next/server';
import { BACKEND_BASE_URL } from '@/lib/backend';

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
    const authHeader = resolveAuthorizationHeader(request);
    if (!authHeader) {
      return NextResponse.json(
        { success: false, server_message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_BASE_URL}/transactions/predict-income`, {
      headers: {
        Authorization: authHeader
      },
      cache: 'no-store'
    });

    const data = (await response.json().catch(() => null));

    if (!response.ok || !data) {
      return NextResponse.json(
        {
          success: false,
          server_message: 'Backend response tidak valid'
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Failed to fetch predicted income', error);
    return NextResponse.json(
      { success: false, server_message: 'Gagal memuat prediksi pendapatan' },
      { status: 500 }
    );
  }
}
