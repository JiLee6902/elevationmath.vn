import { Card } from '@/components/ui/card';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await requireAdmin();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Hệ thống"
        title="Cài đặt"
        description="Tùy chọn hệ thống, tài khoản quản trị và thông tin storage."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Tài khoản</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
              <dt className="text-muted-foreground">Họ tên</dt>
              <dd className="font-medium">{user.fullName ?? '—'}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-medium">{user.role}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Storage</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            File tài liệu lưu trên MinIO (S3-compatible), tự host cùng server.
            Cấu hình qua biến môi trường S3_*. Xem README.md để biết thêm chi
            tiết.
          </p>
        </Card>
      </div>
    </div>
  );
}
