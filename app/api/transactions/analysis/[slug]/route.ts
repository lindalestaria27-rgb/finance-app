import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_BASE_URL } from '@/lib/backend';

function resolveAuthorizationHeader(request: Request): string | null {
  const incomingHeader = request.headers.get('authorization')?.trim();
  if (!incomingHeader) return null;
  return incomingHeader.toLowerCase().startsWith('bearer ')
    ? incomingHeader
    : `Bearer ${incomingHeader}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const allowedSlugs = ['daily-profit', 'weekly-profit', 'monthly-profit'];
    if (!allowedSlugs.includes(slug)) {
      return NextResponse.json({ success: false, server_message: 'Endpoint tidak ditemukan' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    if (!start_date || !end_date) {
      return NextResponse.json({ success: false, server_message: 'Parameter start_date dan end_date diperlukan' }, { status: 400 });
    }

    const authHeader = resolveAuthorizationHeader(request);
    if (!authHeader) {
      return NextResponse.json({ success: false, server_message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${BACKEND_BASE_URL}/transactions/analysis/${slug}?start_date=${start_date}&end_date=${end_date}`,
      {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Failed to fetch analysis:', error);
    return NextResponse.json(
      { success: false, server_message: 'Gagal memuat analisis data' },
      { status: 500 }
    );
  }
}