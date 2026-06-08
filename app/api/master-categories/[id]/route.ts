import { NextResponse } from 'next/server';
import { BACKEND_BASE_URL } from '@/lib/backend';

function resolveAuthorizationHeader(request: Request): string | null {
  const incomingHeader = request.headers.get('authorization')?.trim();
  if (!incomingHeader) return null;
  return incomingHeader.toLowerCase().startsWith('bearer ')
    ? incomingHeader
    : `Bearer ${incomingHeader}`;
}

export async function DELETE(request: Request) {
  try {
    const authHeader = resolveAuthorizationHeader(request);
    if (!authHeader) {
      return NextResponse.json({ success: false, server_message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];
    if (!id) {
      return NextResponse.json({ success: false, server_message: 'ID tidak ditemukan' }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_BASE_URL}/master-categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: authHeader
      }
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data ?? { success: false, server_message: 'Backend response tidak valid' }, {
      status: response.ok ? 200 : response.status
    });
  } catch (error) {
    console.error('Failed to delete master category', error);
    return NextResponse.json({ success: false, server_message: 'Gagal menghapus kategori' }, { status: 500 });
  }
}
