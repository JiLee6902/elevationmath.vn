import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { programGroups } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { programGroupUpdateSchema } from '@/lib/validations/document';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = programGroupUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const [updated] = await db
    .update(programGroups)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(programGroups.id, id))
    .returning();
  return NextResponse.json(updated);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  // FK onDelete: 'set null' → tài liệu thuộc nhóm này chỉ mất gắn nhóm.
  await db.delete(programGroups).where(eq(programGroups.id, id));
  return NextResponse.json({ ok: true });
}
