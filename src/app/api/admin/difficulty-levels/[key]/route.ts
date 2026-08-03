import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { difficultyLevels } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';
import { difficultyLevelUpdateSchema } from '@/lib/validations/document';

const ALLOWED_KEYS = ['co_ban', 'nang_cao'] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  await requireAdmin();
  const { key } = await params;
  if (!ALLOWED_KEYS.includes(key as (typeof ALLOWED_KEYS)[number])) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = difficultyLevelUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dữ liệu không hợp lệ', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(difficultyLevels)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(difficultyLevels.key, key as (typeof ALLOWED_KEYS)[number]))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
