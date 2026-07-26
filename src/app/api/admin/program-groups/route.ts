import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { programGroups } from '@/lib/db/schema';
import { programGroupCreateSchema } from '@/lib/validations/document';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  await requireAdmin();
  const body = await request.json().catch(() => null);
  const parsed = programGroupCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const [created] = await db
    .insert(programGroups)
    .values({
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description ?? null,
      color: data.color,
      order: data.order,
      isActive: data.isActive,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
