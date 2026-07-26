import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { documents, documentTypes, users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { documentCreateSchema } from '@/lib/validations/document';
import { getDocuments } from '@/lib/db/queries';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

function csvParam(sp: URLSearchParams, key: string) {
  const v = sp.get(key);
  if (!v) return undefined;
  const parts = v.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : undefined;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const result = await getDocuments({
    level: sp.get('level') ?? undefined,
    grade: sp.get('grade') ? Number(sp.get('grade')) : undefined,
    chapterIds: csvParam(sp, 'chapter'),
    documentTypeIds: csvParam(sp, 'type'),
    difficulties: csvParam(sp, 'difficulty'),
    status: sp.get('status') ?? undefined,
    search: sp.get('q') ?? undefined,
    page: sp.get('page') ? Number(sp.get('page')) : 1,
    limit: sp.get('limit') ? Number(sp.get('limit')) : 20,
  });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  // Chỉ admin được thêm tài liệu (đã tắt đóng góp phía người dùng).
  if (!user || !isAdmin(user)) {
    return NextResponse.json(
      { error: 'Chỉ quản trị viên được thêm tài liệu' },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = documentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dữ liệu không hợp lệ', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const [documentType] = await db
    .select()
    .from(documentTypes)
    .where(eq(documentTypes.id, data.documentTypeId))
    .limit(1);
  if (
    !documentType ||
    !documentType.isActive ||
    documentType.level !== data.level ||
    documentType.grade !== data.grade
  ) {
    return NextResponse.json(
      { error: 'Loại tài liệu không thuộc lớp đã chọn' },
      { status: 400 },
    );
  }
  const slug = data.slug || slugify(data.title);

  // Đảm bảo slug duy nhất
  let finalSlug = slug;
  for (let i = 1; ; i++) {
    const exist = await db
      .select({ id: documents.id })
      .from(documents)
      .where(eq(documents.slug, finalSlug))
      .limit(1);
    if (exist.length === 0) break;
    finalSlug = `${slug}-${i}`;
    if (i > 50) break;
  }

  // Admin có thể đặt status, user thường thì pending
  const status = isAdmin(user)
    ? ((body.status ?? 'approved') as 'pending' | 'approved' | 'rejected' | 'archived')
    : 'pending';

  const [created] = await db
    .insert(documents)
    .values({
      ...data,
      slug: finalSlug,
      uploaderId: user.id,
      status,
    })
    .returning();

  // Tăng uploadCount cho user
  await db
    .update(users)
    .set({ uploadCount: sql`${users.uploadCount} + 1` })
    .where(eq(users.id, user.id));

  return NextResponse.json(created, { status: 201 });
}
