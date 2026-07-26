import { Card } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await requireAdmin();
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Cài đặt</h1>
        <p className="text-sm text-muted-foreground">
          Tùy chọn hệ thống và tài khoản
        </p>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold mb-3">Tài khoản</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Họ tên</dt>
            <dd>{user.fullName ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Role</dt>
            <dd className="font-medium">{user.role}</dd>
          </div>
        </dl>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold mb-3">Storage</h2>
        <p className="text-sm text-muted-foreground">
          File tài liệu lưu trên MinIO (S3-compatible), tự host cùng server.
          Cấu hình qua biến môi trường S3_*. Xem README.md để biết thêm chi
          tiết.
        </p>
      </Card>
    </div>
  );
}
