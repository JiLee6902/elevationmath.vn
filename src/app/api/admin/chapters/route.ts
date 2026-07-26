import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { chapters } from '@/lib/db/schema';
import { chapterCreateSchema } from '@/lib/validations/user';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  await requireAdmin();
  const body = await request.json().catch(() => null);
  const parsed = chapterCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const [created] = await db
    .insert(chapters)
    .values({
      ...data,
      slug: data.slug || slugify(data.name),
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
