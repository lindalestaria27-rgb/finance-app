import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    {
      date: '2026-04-11',
      category: 'income',
      note: 'Pemesanan Korporat - PT Venture Capital',
      amount: 199200000
    },
    {
      date: '2026-04-10',
      category: 'expense',
      note: 'Sewa Kantor - District 5',
      amount: 83200000
    },
    {
      date: '2026-04-10',
      category: 'expense',
      note: 'Isi Ulang BBM - Armada Batch A',
      amount: 18400000
    },
    {
      date: '2026-04-09',
      category: 'income',
      note: 'Kontrak Mingguan - Medion Ave',
      amount: 142400000
    },
    {
      date: '2026-04-08',
      category: 'income',
      note: 'Paket Antar Jemput Bandara',
      amount: 89600000
    }
  ]);
}
