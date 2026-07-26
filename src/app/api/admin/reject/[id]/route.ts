import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { documentRejectSchema } from '@/lib/validations/document';
import { requireAdmin } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = documentRejectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Cần lý do từ chối' },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(documents)
    .set({
      status: 'rejected',
      rejectReason: parsed.data.reason,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }
  return NextResponse.json(updated);
}
