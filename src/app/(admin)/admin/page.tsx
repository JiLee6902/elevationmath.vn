import Link from 'next/link';
import { Suspense } from 'react';
import { format } from 'date-fns';
import {
  FileText,
  Inbox,
  Users,
  Download,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/admin/stat-card';
import { OverviewChart } from '@/components/admin/overview-chart';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import {
  getStats,
  getRecentDocuments,
  getTopDocuments,
} from '@/lib/db/queries';
import { DOC_STATUS, type DocStatusKey } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Tổng quan"
        title="Dashboard"
        description="Theo dõi tài liệu, người dùng, lượt tải và các nội dung cần duyệt trong hệ thống."
      />

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold tracking-tight">
              Lượt tải về 30 ngày qua
            </h2>
            <Suspense
              fallback={
                <Skeleton className="h-3 w-32 mt-1" />
              }
            >
              <ChartSubtitle />
            </Suspense>
          </div>
        </div>
        <Suspense fallback={<Skeleton className="h-[280px] w-full" />}>
          <ChartSection />
        </Suspense>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold tracking-tight">
              Tài liệu mới upload
            </h2>
            <Link href="/admin/tai-lieu/pending">
              <Button variant="ghost" size="sm" className="group">
                Tất cả
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
          <Suspense fallback={<RowsSkeleton />}>
            <RecentDocsList />
          </Suspense>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold tracking-tight">Top tài liệu</h2>
          <Suspense fallback={<RowsSkeleton />}>
            <TopDocsList />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}

async function StatsCards() {
  const stats = await getStats().catch(() => ({
    totalDocuments: 0,
    pendingDocuments: 0,
    totalUsers: 0,
    monthDownloads: 0,
    downloadsByDay: [],
  }));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Tổng tài liệu"
        value={stats.totalDocuments}
        icon={FileText}
      />
      <StatCard
        title="Đang chờ duyệt"
        value={stats.pendingDocuments}
        icon={Inbox}
        hint="Cần xử lý"
      />
      <StatCard title="Người dùng" value={stats.totalUsers} icon={Users} />
      <StatCard
        title="Tải về 30 ngày"
        value={stats.monthDownloads}
        icon={Download}
      />
    </div>
  );
}

async function ChartSubtitle() {
  const stats = await getStats().catch(() => ({ monthDownloads: 0 }));
  return (
    <p className="text-xs text-muted-foreground">
      Tổng {formatNumber(stats.monthDownloads)} lượt
    </p>
  );
}

async function ChartSection() {
  const stats = await getStats().catch(() => ({ downloadsByDay: [] }));
  return <OverviewChart data={stats.downloadsByDay} />;
}

async function RecentDocsList() {
  const recent = await getRecentDocuments(10).catch(() => []);
  if (recent.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Chưa có tài liệu nào.</p>
    );
  }
  return (
    <div className="space-y-2">
      {recent.map((doc) => {
        const status = DOC_STATUS[doc.status as DocStatusKey];
        return (
          <Link
            key={doc.id}
            href={`/admin/tai-lieu/${doc.id}`}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{doc.title}</p>
              <p className="text-xs text-muted-foreground">
                Lớp {doc.grade} ·{' '}
                {format(new Date(doc.createdAt), 'dd/MM/yyyy')}
              </p>
            </div>
            <Badge variant="secondary" className={status.color}>
              {status.name}
            </Badge>
          </Link>
        );
      })}
    </div>
  );
}

async function TopDocsList() {
  const top = await getTopDocuments(5).catch(() => []);
  if (top.length === 0) {
    return <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>;
  }
  return (
    <div className="space-y-2">
      {top.map((doc, i) => (
        <Link
          key={doc.id}
          href={`/admin/tai-lieu/${doc.id}`}
          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary tabular-nums">
            {i + 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{doc.title}</p>
            <p className="text-xs text-muted-foreground">Lớp {doc.grade}</p>
          </div>
          <span className="flex items-center gap-1 text-sm text-muted-foreground tabular-nums">
            <Download className="size-3.5" />
            {formatNumber(doc.downloadCount)}
          </span>
        </Link>
      ))}
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

function RowsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="size-9 rounded" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
