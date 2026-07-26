import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { documentTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { documentTypeUpdateSchema } from '@/lib/validations/document';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = documentTypeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dữ liệu không hợp lệ', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const [updated] = await db
    .update(documentTypes)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(documentTypes.id, id))
    .returning();
  if (!updated) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  await db.delete(documentTypes).where(eq(documentTypes.id, id));
  return NextResponse.json({ ok: true });
}
