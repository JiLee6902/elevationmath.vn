import Link from 'next/link';
import Image from 'next/image';
import { Download, FileText, Star } from 'lucide-react';
import {
  DIFFICULTIES,
  type DifficultyKey,
} from '@/lib/constants';
import { cn, formatNumber } from '@/lib/utils';
import type { Chapter, Document, DocumentType } from '@/lib/db/schema';

type DocWithChapter = Document & {
  chapter?: Pick<Chapter, 'name'> | null;
  documentType?: Pick<DocumentType, 'name'> | null;
};

type Props = {
  doc: DocWithChapter;
  className?: string;
};

/**
 * Card tài liệu kiểu Scribd: bìa dọc (trang 1 thật nếu có thumbnail, nếu không
 * thì placeholder "trang giấy"), tiêu đề + meta bên dưới.
 */
export function DocCard({ doc, className }: Props) {
  const difficulty = doc.difficulty
    ? DIFFICULTIES[doc.difficulty as DifficultyKey]
    : null;
  const stars = (doc.rating ?? 0) / 10;

  return (
    <Link
      href={`/tai-lieu/${doc.slug}`}
      className={cn('group block focus:outline-none', className)}
    >
      {/* Bìa dọc 3:4 — dấu ấn Scribd */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_12px_28px_-12px_rgb(0_0_0_/_0.22)] group-hover:border-primary/40 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        {doc.thumbnailUrl ? (
          <Image
            src={doc.thumbnailUrl}
            alt={doc.title}
            fill
            sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 45vw"
            className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <PagePlaceholder
            short={`L${doc.grade}`}
            color="from-primary to-sky-600"
            glyph="∑"
            title={doc.title}
          />
        )}

        {/* viền sáng mảnh giả mép giấy */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-black/5"
        />

      </div>

      {/* Metadata nhẹ dưới bìa — giữ artwork sạch, không dùng tag nổi. */}
      <div className="mt-3 px-0.5">
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <FileText className="size-3.5 shrink-0 text-primary/75" />
          <span
            title={doc.documentType?.name ?? 'Tài liệu'}
            className="truncate"
          >
            {doc.documentType?.name ?? 'Tài liệu'}
          </span>
          {difficulty && (
            <>
              <span aria-hidden className="text-border">•</span>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold',
                  difficulty.name === 'Nâng cao'
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-sky-700 dark:text-sky-400',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'size-1.5 rounded-full',
                    difficulty.name === 'Nâng cao'
                      ? 'bg-amber-500'
                      : 'bg-sky-500',
                  )}
                />
                {difficulty.name}
              </span>
            </>
          )}
        </div>
        <p className="truncate text-sm font-medium text-foreground/80 transition-colors group-hover:text-primary">
          Lớp {doc.grade}
          {doc.chapter?.name && (
            <>
              <span className="mx-1 opacity-50">·</span>
              {doc.chapter.name}
            </>
          )}
        </p>
        <div className="mt-1.5 flex items-center gap-3 text-sm text-muted-foreground">
          {stars > 0 && (
            <span className="flex items-center gap-1 font-medium text-foreground/80">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {stars.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Download className="size-4" />
            {formatNumber(doc.downloadCount)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Bìa "thiết kế" có màu khi chưa có ảnh thật: gradient theo lớp học +
 * hoạ tiết chấm + ký hiệu toán + mã bộ sách. Trông như bìa sách tạo tự động.
 */
function PagePlaceholder({
  short,
  color,
  glyph,
  title,
}: {
  short: string;
  color: string;
  glyph: string;
  title: string;
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col bg-gradient-to-br',
        color,
      )}
    >
      {/* hoạ tiết chấm */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.22) 1px, transparent 0)',
          backgroundSize: '13px 13px',
          maskImage: 'linear-gradient(140deg, black, transparent 80%)',
        }}
      />
      {/* vệt sáng chéo */}
      <span
        aria-hidden
        className="absolute -left-1/4 top-0 h-full w-1/2 -skew-x-12 bg-white/10"
      />
      {/* ký hiệu toán watermark lớn */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-8 -right-3 select-none font-display text-[8.5rem] leading-none text-white/15"
      >
        {glyph}
      </span>
      {/* tiêu đề trên bìa — như bìa sách */}
      <div className="relative flex flex-1 flex-col p-4">
        <span className="font-display text-3xl font-bold tracking-tight text-white/95 drop-shadow-sm">
          {short}
        </span>
        <p className="mt-2 line-clamp-4 text-base font-semibold leading-snug text-white drop-shadow-sm">
          {title}
        </p>
      </div>
    </div>
  );
}
