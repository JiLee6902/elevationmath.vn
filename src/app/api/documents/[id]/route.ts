import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { documents, documentTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { documentUpdateSchema } from '@/lib/validations/document';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);
  if (!doc) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }
  return NextResponse.json(doc);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = documentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }

  const [current] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);
  if (!current) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }
  const targetLevel = parsed.data.level ?? current.level;
  const targetGrade = parsed.data.grade ?? current.grade;
  const targetTypeId = parsed.data.documentTypeId ?? current.documentTypeId;
  if (targetTypeId) {
    const [documentType] = await db
      .select()
      .from(documentTypes)
      .where(eq(documentTypes.id, targetTypeId))
      .limit(1);
    if (
      !documentType ||
      documentType.level !== targetLevel ||
      documentType.grade !== targetGrade
    ) {
      return NextResponse.json(
        { error: 'Loại tài liệu không thuộc lớp đã chọn' },
        { status: 400 },
      );
    }
  }

  const [updated] = await db
    .update(documents)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(documents.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  const [updated] = await db
    .update(documents)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(eq(documents.id, id))
    .returning();
  if (!updated) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
