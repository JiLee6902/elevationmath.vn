import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { documentTypes } from '@/lib/db/schema';
import { documentTypeCreateSchema } from '@/lib/validations/document';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  await requireAdmin();
  const body = await request.json().catch(() => null);
  const parsed = documentTypeCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dữ liệu không hợp lệ', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const [created] = await db
    .insert(documentTypes)
    .values({
      ...data,
      slug:
        data.slug || slugify(`${data.level}-lop-${data.grade}-${data.name}`),
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
