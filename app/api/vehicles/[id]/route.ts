import { NextResponse } from 'next/server';
import { BACKEND_BASE_URL } from '@/lib/backend';

function resolveAuthorizationHeader(request: Request): string | null {
  const incomingHeader = request.headers.get('authorization')?.trim();
  if (!incomingHeader) return null;
  return incomingHeader.toLowerCase().startsWith('bearer ')
    ? incomingHeader
    : `Bearer ${incomingHeader}`;
}

function extractIdFromUrl(request: Request) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  return parts[parts.length - 1];
}

export async function GET(request: Request) {
  try {
    const authHeader = resolveAuthorizationHeader(request);
    if (!authHeader) return NextResponse.json({ success: false, server_message: 'Unauthorized' }, { status: 401 });
    const id = extractIdFromUrl(request);
    const response = await fetch(`${BACKEND_BASE_URL}/vehicles/${encodeURIComponent(id)}`, {
      headers: { Authorization: authHeader },
      cache: 'no-store'
    });
    const data = await response.json().catch(() => null);
    return NextResponse.json(data ?? { success: false, server_message: 'Backend response tidak valid' }, { status: response.ok ? 200 : response.status });
  } catch (error) {
    console.error('Failed to fetch vehicle', error);
    return NextResponse.json({ success: false, server_message: 'Gagal memuat kendaraan' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = resolveAuthorizationHeader(request);
    if (!authHeader) return NextResponse.json({ success: false, server_message: 'Unauthorized' }, { status: 401 });
    const id = extractIdFromUrl(request);
    const body = await request.json().catch(() => null);
    const response = await fetch(`${BACKEND_BASE_URL}/vehicles/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    });
    const data = await response.json().catch(() => null);
    return NextResponse.json(data ?? { success: false, server_message: 'Backend response tidak valid' }, { status: response.ok ? 200 : response.status });
  } catch (error) {
    console.error('Failed to patch vehicle', error);
    return NextResponse.json({ success: false, server_message: 'Gagal memperbarui kendaraan' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = resolveAuthorizationHeader(request);
    if (!authHeader) return NextResponse.json({ success: false, server_message: 'Unauthorized' }, { status: 401 });
    const id = extractIdFromUrl(request);
    const response = await fetch(`${BACKEND_BASE_URL}/vehicles/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: authHeader },
    });
    const data = await response.json().catch(() => null);
    return NextResponse.json(data ?? { success: false, server_message: 'Backend response tidak valid' }, { status: response.ok ? 200 : response.status });
  } catch (error) {
    console.error('Failed to delete vehicle', error);
    return NextResponse.json({ success: false, server_message: 'Gagal menghapus kendaraan' }, { status: 500 });
  }
}
