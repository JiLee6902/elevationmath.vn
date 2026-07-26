import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { documents, downloads, users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { parseStorageUrl, signDownloadUrl } from '@/lib/storage';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!doc || doc.status !== 'approved') {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  const user = await getCurrentUser();
  // Bắt buộc đăng nhập mới tải được (gate phía server, không chỉ popup).
  if (!user) {
    return NextResponse.json(
      { error: 'Cần đăng ký / đăng nhập để tải tài liệu' },
      { status: 401 },
    );
  }
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null;

  await db.insert(downloads).values({
    documentId: doc.id,
    userId: user?.id ?? null,
    ipAddress: ip,
  });

  await db
    .update(documents)
    .set({ downloadCount: sql`${documents.downloadCount} + 1` })
    .where(eq(documents.id, id));

  if (user) {
    await db
      .update(users)
      .set({ downloadCount: sql`${users.downloadCount} + 1` })
      .where(eq(users.id, user.id));
  }

  // Nếu fileUrl là s3:// hoặc URL nội bộ → ký lại từ MinIO
  // Nếu là URL ngoài (vd sample PDF cho seed) → trả về nguyên
  const parsed = parseStorageUrl(doc.fileUrl);
  if (!parsed) {
    return NextResponse.json({ url: doc.fileUrl });
  }

  try {
    const signed = await signDownloadUrl(parsed.bucket, parsed.key, 3600);
    return NextResponse.json({ url: signed });
  } catch {
    return NextResponse.json(
      { error: 'Không tạo được link tải' },
      { status: 500 },
    );
  }
}
