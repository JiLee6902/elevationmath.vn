import { Card } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { OverviewChart } from '@/components/admin/overview-chart';
import { getStats } from '@/lib/db/queries';
import { formatNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const stats = await getStats().catch(() => ({
    totalDocuments: 0,
    pendingDocuments: 0,
    totalUsers: 0,
    monthDownloads: 0,
    downloadsByDay: [],
  }));

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-semibold">Thống kê</h1>
        <p className="text-sm text-muted-foreground">
          Tổng quan hoạt động trên hệ thống
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="docs">Tài liệu</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="downloads">Lượt tải</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card className="p-5">
            <h2 className="font-semibold">Lượt tải 30 ngày qua</h2>
            <p className="text-2xl font-semibold mt-1">
              {formatNumber(stats.monthDownloads)}
            </p>
            <div className="mt-4">
              <OverviewChart data={stats.downloadsByDay} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Tổng số</p>
            <p className="text-2xl font-semibold">
              {formatNumber(stats.totalDocuments)}
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Tài khoản</p>
            <p className="text-2xl font-semibold">
              {formatNumber(stats.totalUsers)}
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="downloads" className="mt-4">
          <Card className="p-5">
            <OverviewChart data={stats.downloadsByDay} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
