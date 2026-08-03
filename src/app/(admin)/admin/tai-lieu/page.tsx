import Link from 'next/link';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { getDocuments } from '@/lib/db/queries';
import { DocsTable } from './docs-table';

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Quản lý nội dung"
        title="Tài liệu"
        description={
          <Suspense fallback={<Skeleton className="mt-1 h-4 w-32" />}>
            <DocsCount status={sp.status} />
          </Suspense>
        }
        action={
          <Link href="/admin/tai-lieu/new">
          <Button>
            <Plus className="size-4" />
            Tạo mới
          </Button>
          </Link>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <DocsSection status={sp.status} />
      </Suspense>
    </div>
  );
}

async function DocsCount({ status }: { status?: string }) {
  const result = await getDocuments({ status, limit: 200 }).catch(() => ({
    total: 0,
  }));
  return (
    <p className="text-sm text-muted-foreground">{result.total} tài liệu</p>
  );
}

async function DocsSection({ status }: { status?: string }) {
  const result = await getDocuments({ status, limit: 200 }).catch(() => ({
    data: [],
    total: 0,
    page: 1,
    limit: 200,
    totalPages: 0,
  }));
  return <DocsTable docs={result.data} />;
}

function TableSkeleton() {
  return (
    <div className="rounded-md border bg-card p-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 border-b last:border-0"
        >
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      ))}
    </div>
  );
}
