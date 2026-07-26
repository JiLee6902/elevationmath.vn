import { Suspense } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, GraduationCap } from 'lucide-react';
import { DocGrid } from '@/components/user/doc-grid';
import { DocGridSkeleton } from '@/components/user/doc-grid-skeleton';
import { Pagination } from '@/components/user/pagination';
import { Breadcrumb } from '@/components/user/breadcrumb';
import { SearchForm } from '@/components/user/search-form';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { LEVELS, type LevelKey } from '@/lib/constants';
import { getDocuments } from '@/lib/db/queries';
import { formatNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Tìm kiếm — Elevation Math' };

type SearchParams = Record<string, string | string[] | undefined>;

const POPULAR = [
  'Đề thi',
  'Luyện thi vào 10',
  'Tích phân',
  'Hình học',
  'Đạo hàm',
  'Bồi dưỡng HSG',
];

function pickString(v: string | string[] | undefined) {
  return typeof v === 'string' ? v : undefined;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = pickString(sp.q)?.trim() ?? '';
  const pageRaw = Number(pickString(sp.page) ?? '1');
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  return (
    <div className="pb-16">
      {/* Header + ô tìm kiếm ngay trên trang */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/[0.05] to-transparent">
        <span
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `linear-gradient(to right, color-mix(in oklch, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 5%, transparent) 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
            maskImage:
              'radial-gradient(70% 90% at 50% 0%, black 20%, transparent 85%)',
          }}
        />
        <div className="container relative mx-auto px-4 py-10 md:py-12">
          <Breadcrumb
            items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tìm kiếm' }]}
          />
          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
            {q ? (
              <>
                Kết quả cho{' '}
                <span className="text-primary">&ldquo;{q}&rdquo;</span>
              </>
            ) : (
              <>
                Tìm kiếm <span className="text-primary">tài liệu toán</span>
              </>
            )}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Lý thuyết, bài tập, đề thi từ lớp 1 đến lớp 12 — tìm theo từ khoá
            hoặc duyệt theo cấp học.
          </p>
          <SearchForm
            defaultValue={q}
            autoFocus={!q}
            className="mt-5 max-w-2xl"
          />
        </div>
      </section>

      <div className="container mx-auto px-4 pt-12">
        {q ? (
          <Suspense fallback={<DocGridSkeleton count={12} />}>
            <Results q={q} page={page} />
          </Suspense>
        ) : (
          <Suggestions />
        )}
      </div>
    </div>
  );
}

/** Khi chưa nhập từ khoá — gợi ý thay vì màn trống. */
function Suggestions() {
  return (
    <div className="space-y-10">
      <div>
        <div className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          <TrendingUp className="size-3.5" />
          Từ khoá phổ biến
        </div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          Mọi người đang tìm gì
        </h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {POPULAR.map((k) => (
            <Link
              key={k}
              href={`/tim-kiem?q=${encodeURIComponent(k)}`}
              className="rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
            >
              {k}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          <GraduationCap className="size-3.5" />
          Duyệt theo cấp học
        </div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          Chọn theo cấp lớp của bạn
        </h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {(Object.keys(LEVELS) as LevelKey[]).map((lvl) => (
            <Link
              key={lvl}
              href={`/${LEVELS[lvl].slug}`}
              className="rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
            >
              {LEVELS[lvl].name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

async function Results({ q, page }: { q: string; page: number }) {
  const result = await getDocuments({
    search: q,
    status: 'approved',
    page,
    limit: 24,
  }).catch(() => ({
    data: [],
    total: 0,
    page: 1,
    limit: 24,
    totalPages: 0,
  }));

  if (result.total === 0) {
    return (
      <EmptyState
        icon={Search}
        title="Không tìm thấy tài liệu"
        description={`Không có tài liệu nào khớp với "${q}". Hãy thử từ khoá khác hoặc duyệt theo lớp.`}
        action={
          <Link href="/">
            <Button variant="outline">Về trang chủ</Button>
          </Link>
        }
      />
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground">
        Tìm thấy{' '}
        <strong className="text-foreground">
          {formatNumber(result.total)}
        </strong>{' '}
        tài liệu
      </p>
      <DocGrid docs={result.data} />
      {result.totalPages > 1 && (
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          className="mt-12"
        />
      )}
    </>
  );
}
