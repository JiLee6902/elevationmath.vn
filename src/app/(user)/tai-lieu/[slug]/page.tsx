import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Calendar,
  Download,
  Eye,
  FileText,
  Lock,
  Star,
  User as UserIcon,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/user/breadcrumb';
import { StarRating } from '@/components/shared/star-rating';
import {
  DIFFICULTIES,
  LEVELS,
  type DifficultyKey,
  type LevelKey,
} from '@/lib/constants';
import { getCurrentUser } from '@/lib/auth';
import { getDocumentBySlug, getRelatedDocuments } from '@/lib/db/queries';
import { parseStorageUrl, signDownloadUrl } from '@/lib/storage';
import { cn, formatNumber } from '@/lib/utils';
import type { Chapter, Document } from '@/lib/db/schema';
import { DocToolbar } from './doc-toolbar';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [doc, user] = await Promise.all([
    getDocumentBySlug(slug).catch(() => null),
    getCurrentUser().catch(() => null),
  ]);

  if (!doc || doc.status !== 'approved') notFound();
  const isAuthed = !!user;

  // Với user đã đăng nhập: nếu file nằm trong MinIO (s3://) → ký URL tạm thời
  // để xem trong iframe; file vẫn riêng tư, khách không có link.
  let viewerUrl = doc.fileUrl;
  if (isAuthed) {
    const parsed = parseStorageUrl(doc.fileUrl);
    if (parsed) {
      viewerUrl = await signDownloadUrl(parsed.bucket, parsed.key, 3600).catch(
        () => doc.fileUrl,
      );
    }
  }

  const level = LEVELS[doc.level as LevelKey];
  const documentTypeName = doc.documentType?.name ?? 'Tài liệu';
  const difficulty = doc.difficulty
    ? DIFFICULTIES[doc.difficulty as DifficultyKey]
    : null;

  const related = await getRelatedDocuments(doc, 8).catch(() => []);
  const stars = (doc.rating ?? 0) / 10;
  const glyph = '∑';
  const isPdf =
    doc.fileType === 'application/pdf' || doc.fileUrl.endsWith('.pdf');
  const isImage = doc.fileType?.startsWith('image/');

  return (
    <div className="bg-muted/30">
      {/* Toolbar kiểu Scribd — dính dưới header */}
      <div className="sticky top-14 z-30 border-b bg-card/95 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center gap-3 px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <FileText className="size-4 shrink-0 text-primary" />
            <span className="truncate text-sm font-medium">{doc.title}</span>
            <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
              <Eye className="size-3.5" />
              {formatNumber(doc.viewCount)} lượt xem
            </span>
          </div>
          <DocToolbar
            documentId={doc.id}
            fileUrl={doc.fileUrl}
            isAuthed={isAuthed}
            className="shrink-0"
          />
        </div>
      </div>

      {/* Hero tài liệu */}
      <section
        className={cn(
          'relative overflow-hidden border-b bg-gradient-to-br',
          'from-primary to-sky-600',
        )}
      >
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)',
            backgroundSize: '18px 18px',
            maskImage: 'linear-gradient(135deg, black, transparent 75%)',
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -right-3 select-none font-display text-[8rem] leading-none text-white/15"
        >
          {glyph}
        </span>
        <div className="container relative mx-auto px-4 py-10 md:py-12">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: '/' },
              { label: level.name, href: `/${level.slug}` },
              {
                label: `Lớp ${doc.grade}`,
                href: `/${level.slug}/lop-${doc.grade}`,
              },
              { label: doc.title },
            ]}
            light
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              Lớp {doc.grade}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {documentTypeName}
            </span>
            {difficulty && (
              <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                {difficulty.name}
              </span>
            )}
          </div>

          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
            {doc.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
            {stars > 0 && (
              <span className="flex items-center gap-1.5">
                <StarRating value={stars} size="sm" />
                <span className="font-medium text-white">
                  {stars.toFixed(1)}
                </span>
                <span>({formatNumber(doc.ratingCount ?? 0)})</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Download className="size-3.5" />
              {formatNumber(doc.downloadCount)} lượt tải
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {formatDistanceToNow(new Date(doc.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
            {doc.uploader && (
              <span className="inline-flex items-center gap-1.5">
                <UserIcon className="size-3.5" />
                {doc.uploader.fullName ?? doc.uploader.email}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 pb-28 lg:pb-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Cột chính: tài liệu + mô tả */}
          <div className="min-w-0">
            {/* Khung tài liệu — "trang giấy" kiểu Scribd.
                Khách chưa đăng nhập: chỉ teaser bìa + lớp phủ đăng ký (không
                render PDF gốc → không tải/in được qua trình duyệt). */}
            {!isAuthed ? (
              <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
                {doc.thumbnailUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={doc.thumbnailUrl}
                    alt={doc.title}
                    className="max-h-[78vh] w-full object-contain object-top"
                  />
                ) : (
                  <div className="aspect-[3/4] w-full bg-muted sm:aspect-[16/10]" />
                )}
                <div className="absolute inset-x-0 bottom-0 top-1/4 flex flex-col items-center justify-end gap-1 bg-gradient-to-t from-card via-card/95 to-transparent p-8 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Lock className="size-6" />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">
                    Đăng ký để đọc &amp; tải tài liệu
                  </h3>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Tạo tài khoản miễn phí để xem toàn bộ nội dung và tải về.
                    Chỉ mất 30 giây.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <Link href="/dang-ky">
                      <Button size="lg" className="gap-1.5">
                        Đăng ký miễn phí
                        <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                    <Link href="/dang-nhap">
                      <Button size="lg" variant="outline">
                        Đăng nhập
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                {isImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={viewerUrl}
                    alt={doc.title}
                    className="max-h-[80vh] w-full bg-muted object-contain"
                  />
                ) : isPdf ? (
                  <iframe
                    src={viewerUrl}
                    className="h-[85vh] w-full bg-muted"
                    title={doc.title}
                  />
                ) : (
                  <div className="flex aspect-[16/9] flex-col items-center justify-center bg-muted text-muted-foreground">
                    <div className="mb-3 flex size-12 items-center justify-center rounded-full border bg-card">
                      <FileText className="size-5" />
                    </div>
                    <p className="font-medium text-foreground">
                      Không xem được trực tiếp
                    </p>
                    <p className="mt-1 text-sm">
                      Vui lòng tải về để xem nội dung
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mô tả */}
            {doc.description && (
              <div className="mt-8">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Giới thiệu
                </h2>
                <p className="mt-2.5 leading-relaxed text-foreground/90">
                  {doc.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {doc.tags && doc.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {doc.tags.map((t: string) => (
                  <Link
                    key={t}
                    href={`/tim-kiem?q=${encodeURIComponent(t)}`}
                    className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            {/* Thông tin chi tiết */}
            <div className="mt-8 rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Thông tin tài liệu
              </h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-3">
                <Row label="Cấp học" value={level.name} />
                <Row label="Lớp" value={`Lớp ${doc.grade}`} />
                {doc.chapter && (
                  <Row
                    label="Chương"
                    value={`${doc.chapter.number}. ${doc.chapter.name}`}
                  />
                )}
                <Row label="Loại" value={documentTypeName} />
                <Row
                  label="Đăng ngày"
                  value={format(new Date(doc.createdAt), 'dd/MM/yyyy')}
                />
              </dl>
            </div>
          </div>

          {/* Cột phải: Tài liệu liên quan (kiểu "You might also like") */}
          <aside className="lg:border-l lg:pl-6">
            <div className="lg:sticky lg:top-32">
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Tài liệu liên quan
              </h2>
              {related.length > 0 ? (
                <div className="flex flex-col divide-y">
                  {related.map((d) => (
                    <RelatedItem key={d.id} doc={d} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có tài liệu liên quan.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Thanh tải về dính dưới — mobile */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_-4px_rgb(0_0_0_/_0.08)] backdrop-blur-md lg:hidden">
        <div className="container mx-auto flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs text-muted-foreground">
              Lớp {doc.grade} · {documentTypeName}
            </div>
            <div className="truncate text-sm font-medium">{doc.title}</div>
          </div>
          <DocToolbar
            documentId={doc.id}
            fileUrl={doc.fileUrl}
            variant="compact"
            isAuthed={isAuthed}
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  );
}

type DocWithChapter = Document & { chapter?: Pick<Chapter, 'name'> | null };

function RelatedItem({ doc }: { doc: DocWithChapter }) {
  const stars = (doc.rating ?? 0) / 10;
  return (
    <Link
      href={`/tai-lieu/${doc.slug}`}
      className="group flex gap-3 py-3 first:pt-0"
    >
      {/* mini bìa */}
      <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-md border bg-card">
        {doc.thumbnailUrl ? (
          <Image
            src={doc.thumbnailUrl}
            alt={doc.title}
            fill
            sizes="56px"
            className="object-cover object-top"
          />
        ) : (
          <div
            className={cn(
              'flex h-full w-full items-center justify-center bg-gradient-to-br font-display text-lg text-white/80',
              'from-primary to-sky-600',
            )}
          >
            L{doc.grade}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-primary">
          {doc.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Lớp {doc.grade}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {stars > 0 && (
            <span className="flex items-center gap-0.5 font-medium text-foreground/70">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {stars.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <Download className="size-3" />
            {formatNumber(doc.downloadCount)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
