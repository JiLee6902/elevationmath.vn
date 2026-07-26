import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { documents, users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  const { id } = await params;

  const [updated] = await db
    .update(documents)
    .set({
      status: 'approved',
      approvedById: admin.id,
      approvedAt: new Date(),
      rejectReason: null,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  // +10 điểm cho uploader
  if (updated.uploaderId) {
    await db
      .update(users)
      .set({ points: sql`${users.points} + 10` })
      .where(eq(users.id, updated.uploaderId));
  }

  return NextResponse.json(updated);
}
