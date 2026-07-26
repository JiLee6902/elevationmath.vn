import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import {
  Target,
  TrendingUp,
  Trophy,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { Breadcrumb } from '@/components/user/breadcrumb';
import { GradeMultiFilter } from '@/components/user/grade-multi-filter';
import { DocGrid } from '@/components/user/doc-grid';
import { DocGridSkeleton } from '@/components/user/doc-grid-skeleton';
import { Pagination } from '@/components/user/pagination';
import { LEVELS, type LevelKey } from '@/lib/constants';
import {
  getDocuments,
  getGradeCountsForProgramGroup,
  getProgramGroupBySlug,
  getProgramGroups,
} from '@/lib/db/queries';
import { cn, formatNumber, groupGradient } from '@/lib/utils';
import type { DocumentSort } from '@/types';

export const dynamic = 'force-dynamic';

const VALID_SORTS: ReadonlySet<DocumentSort> = new Set([
  'newest',
  'popular',
  'top_rated',
]);

const GROUP_ICONS: Record<string, typeof Target> = {
  'lay-goc': Target,
  'phat-trien': TrendingUp,
  'nang-cao': Trophy,
  'luyen-thi': GraduationCap,
};

const LEVEL_ORDER: LevelKey[] = ['tieu_hoc', 'thcs', 'thpt'];
const ALL_GRADES = new Set(
  (Object.values(LEVELS) as { grades: readonly number[] }[]).flatMap(
    (l) => l.grades,
  ),
);

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const group = await getProgramGroupBySlug(slug);
  if (!group) notFound();

  const [allGroups, gradeCounts] = await Promise.all([
    getProgramGroups().catch(() => []),
    getGradeCountsForProgramGroup(group.id).catch(() => []),
  ]);

  const sortRaw = typeof sp.sort === 'string' ? sp.sort : undefined;
  const sort: DocumentSort = (
    sortRaw && VALID_SORTS.has(sortRaw as DocumentSort) ? sortRaw : 'newest'
  ) as DocumentSort;
  const pageRaw = Number(typeof sp.page === 'string' ? sp.page : '1');
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  // Chọn NHIỀU lớp qua CSV ?grade=3,6,9
  const activeGrades = (typeof sp.grade === 'string' ? sp.grade : '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && ALL_GRADES.has(n));
  const total = gradeCounts.reduce((s, g) => s + g.count, 0);
  const base = `/nhom/${slug}`;
  // Giữ filter lớp + sort khi chuyển sang nhóm khác
  const carry = new URLSearchParams();
  if (activeGrades.length) carry.set('grade', activeGrades.join(','));
  if (sort !== 'newest') carry.set('sort', sort);
  const carryQs = carry.toString() ? `?${carry.toString()}` : '';

  // Tất cả lớp theo cấp học (lớp không có tài liệu → count 0)
  const countByGrade = new Map(gradeCounts.map((g) => [g.grade, g.count]));
  const gradesByLevel = LEVEL_ORDER.map((lvl) => ({
    level: lvl,
    grades: (LEVELS[lvl].grades as readonly number[]).map((g) => ({
      grade: g,
      count: countByGrade.get(g) ?? 0,
    })),
  }));

  const Icon = GROUP_ICONS[group.slug] ?? Layers;

  return (
    <div>
      {/* Header nhóm — nền sáng + accent màu (hiện đại) */}
      <section className="relative overflow-hidden border-b bg-card">
        {/* glow màu mờ từ màu nhóm */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-24 size-80 rounded-full opacity-20 blur-3xl"
          style={{ background: group.color }}
        />
        {/* lưới graph mờ */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, color-mix(in oklch, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 5%, transparent) 1px, transparent 1px)`,
            backgroundSize: '34px 34px',
            maskImage: 'radial-gradient(70% 90% at 30% 0%, black, transparent 80%)',
          }}
        />
        <div className="container relative mx-auto px-4 py-10 md:py-12">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: '/' },
              { label: 'Nhóm chương trình' },
              { label: group.name },
            ]}
          />
          <div className="mt-5 flex items-start gap-4">
            <span
              className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ring-1 ring-black/5"
              style={{ background: groupGradient(group.color) }}
            >
              <Icon className="size-7" />
            </span>
            <div className="min-w-0">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: `color-mix(in oklab, ${group.color} 78%, #000)` }}
              >
                Nhóm chương trình
              </p>
              <h1 className="mt-1 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
                {group.name}
              </h1>
              {group.description && (
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  {group.description}
                </p>
              )}
            </div>
          </div>
          {total > 0 && (
            <p className="mt-5 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatNumber(total)}
              </span>{' '}
              tài liệu đã được kiểm duyệt
            </p>
          )}
        </div>
      </section>

      {/* Tabs các nhóm khác */}
      {allGroups.length > 1 && (
        <div className="border-b bg-card/40">
          <div className="no-scrollbar container mx-auto flex gap-1 overflow-x-auto px-4">
            {allGroups.map((g) => (
              <a
                key={g.id}
                href={`/nhom/${g.slug}${carryQs}`}
                className={cn(
                  'shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition-colors',
                  g.slug === group.slug
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {g.name}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Lọc theo lớp — dropdown đa chọn theo khối */}
        <div className="mb-6">
          <GradeMultiFilter
            blocks={gradesByLevel.map((b) => ({
              levelName: LEVELS[b.level].name,
              grades: b.grades,
            }))}
            selected={activeGrades}
            base={base}
            sort={sort}
          />
        </div>

        <Suspense fallback={<DocGridSkeleton count={12} />}>
          <Results
            programGroupId={group.id}
            grades={activeGrades}
            sort={sort}
            page={page}
          />
        </Suspense>
      </div>
    </div>
  );
}

async function Results({
  programGroupId,
  grades,
  sort,
  page,
}: {
  programGroupId: string;
  grades: number[];
  sort: DocumentSort;
  page: number;
}) {
  const docs = await getDocuments({
    programGroupId,
    grades: grades.length ? grades : undefined,
    status: 'approved',
    sort,
    page,
    limit: 24,
  }).catch(() => ({ data: [], total: 0, page: 1, limit: 24, totalPages: 0 }));

  const gradeLabel =
    grades.length > 0
      ? ` · ${grades.length === 1 ? `Lớp ${grades[0]}` : `${grades.length} lớp`}`
      : '';

  return (
    <>
      <p className="mb-5 text-sm text-muted-foreground">
        {docs.total > 0
          ? `${formatNumber(docs.total)} tài liệu${gradeLabel}`
          : 'Chưa có tài liệu phù hợp'}
      </p>
      <DocGrid docs={docs.data} />
      {docs.totalPages > 1 && (
        <Pagination
          page={docs.page}
          totalPages={docs.totalPages}
          className="mt-10"
        />
      )}
    </>
  );
}
