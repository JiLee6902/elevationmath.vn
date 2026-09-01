import { notFound } from 'next/navigation';
import { Breadcrumb } from './breadcrumb';
import { SubNav } from './sub-nav';
import { SidebarFilter } from './sidebar-filter';
import { FilterToolbar } from './filter-toolbar';
import { DocGrid } from './doc-grid';
import { EmptyState } from '@/components/shared/empty-state';
import { BookOpen } from 'lucide-react';
import { LEVELS, type LevelKey } from '@/lib/constants';
import {
  getDocuments,
  getDocumentTypes,
  getDocumentCategories,
} from '@/lib/db/queries';

type SearchParams = Record<string, string | string[] | undefined>;
const pick = (value: string | string[] | undefined) => typeof value === 'string' ? value : undefined;
const csv = (value: string | undefined) => value?.split(',').map((item) => item.trim()).filter(Boolean);

export async function GradePage({ level, grade, searchParams }: { level: LevelKey; grade: number; searchParams: Promise<SearchParams> }) {
  if (!LEVELS[level].grades.includes(grade as never)) notFound();
  const params = await searchParams;
  const [result, documentTypes, categories] = await Promise.all([
    getDocuments({
      level,
      grade,
      documentTypeIds: csv(pick(params.type)),
      difficulties: csv(pick(params.difficulty)),
      sort: pick(params.sort) as 'newest' | 'popular' | 'top_rated' | undefined,
      page: Number(pick(params.page) ?? '1'),
      limit: 24,
    }),
    getDocumentTypes({ level, grade }),
    getDocumentCategories(),
  ]);

  return (
    <div className="pb-16">
      <SubNav level={level} grade={grade} />
      <section className="border-b bg-gradient-to-b from-primary/[0.06] to-transparent">
        <div className="container mx-auto px-4 py-9">
          <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: LEVELS[level].name, href: `/${LEVELS[level].slug}` }, { label: `Lớp ${grade}` }]} />
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Tài liệu theo lớp</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Tài liệu Toán lớp {grade}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Chọn tài liệu theo mục tiêu học tập và mức độ phù hợp với bạn.</p>
        </div>
      </section>
      <div className="container mx-auto flex gap-8 px-4 pt-8">
        <SidebarFilter documentTypes={documentTypes} categories={categories} />
        <main className="min-w-0 flex-1">
          <FilterToolbar total={result.total} documentTypes={documentTypes} />
          {result.data.length > 0 ? <DocGrid docs={result.data} /> : <EmptyState icon={BookOpen} title="Chưa có tài liệu" description="Tài liệu cho lớp này sẽ sớm được cập nhật." />}
        </main>
      </div>
    </div>
  );
}
