import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getDocuments } from '@/lib/db/queries';
import { PendingTable } from './pending-table';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-semibold">Duyệt bài</h1>
        <Suspense fallback={<Skeleton className="h-4 w-48 mt-1" />}>
          <PendingSubtitle />
        </Suspense>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <PendingSection />
      </Suspense>
    </div>
  );
}

async function PendingSubtitle() {
  const result = await getDocuments({
    status: 'pending',
    limit: 100,
  }).catch(() => ({ total: 0 }));
  return (
    <p className="text-sm text-muted-foreground">
      {result.total} tài liệu đang chờ duyệt
    </p>
  );
}

async function PendingSection() {
  const result = await getDocuments({
    status: 'pending',
    limit: 100,
  }).catch(() => ({
    data: [],
    total: 0,
    page: 1,
    limit: 100,
    totalPages: 0,
  }));
  return <PendingTable docs={result.data} />;
}

function TableSkeleton() {
  return (
    <div className="rounded-md border bg-card p-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border-b last:border-0">
          <Skeleton className="size-9 rounded" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}
