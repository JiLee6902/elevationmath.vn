import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getStats } from '@/lib/db/queries';

export async function GET() {
  await requireAdmin();
  const stats = await getStats();
  return NextResponse.json(stats);
}
