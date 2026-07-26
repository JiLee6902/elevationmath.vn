import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { MAX_FILE_SIZE } from '@/lib/constants';
import {
  BUCKET_APPROVED,
  BUCKET_COVERS,
  buildPublicCoverUrl,
  buildStorageUrl,
  uploadFile,
} from '@/lib/storage';
import { renderPdfPage } from '@/lib/pdf-cover';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  // Chỉ admin được thêm tài liệu (đã tắt upload phía người dùng).
  if (!user || !isAdmin(user)) {
    return NextResponse.json(
      { error: 'Chỉ quản trị viên được thêm tài liệu' },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Thiếu file' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File vượt quá kích thước cho phép' },
      { status: 413 },
    );
  }

  const ext = (file.name.split('.').pop() ?? 'bin').toLowerCase();
  const key = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  try {
    await uploadFile(BUCKET_APPROVED, key, buf, file.type || undefined);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Upload thất bại';
    return NextResponse.json(
      { error: `Upload thất bại: ${msg}` },
      { status: 500 },
    );
  }

  // Render ảnh bìa từ trang 1 (PDF) → bucket công khai.
  // Lỗi → bỏ qua (fallback bìa màu thiết kế).
  let thumbnailUrl: string | undefined;
  const isPdf = file.type === 'application/pdf' || ext === 'pdf';
  if (isPdf) {
    try {
      const png = await renderPdfPage(buf, 1, 600);
      const coverKey = `${key}.png`;
      await uploadFile(BUCKET_COVERS, coverKey, png, 'image/png');
      thumbnailUrl = buildPublicCoverUrl(coverKey);
    } catch (e) {
      console.warn('[upload] render bìa thất bại:', (e as Error).message);
    }
  }

  return NextResponse.json({
    fileUrl: buildStorageUrl(BUCKET_APPROVED, key),
    fileSize: file.size,
    fileType: file.type,
    thumbnailUrl,
  });
}
