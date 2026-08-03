import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { UsersTable } from './users-table';
import { AdminPageHeader } from '@/components/admin/admin-page-header';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const list = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(500)
    .catch(() => []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Tài khoản"
        title="Người dùng"
        description={`${list.length} tài khoản đang có trong hệ thống.`}
      />
      <UsersTable users={list} />
    </div>
  );
}
