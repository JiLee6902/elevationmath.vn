import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { UsersTable } from './users-table';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const list = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(500)
    .catch(() => []);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-semibold">Người dùng</h1>
        <p className="text-sm text-muted-foreground">{list.length} tài khoản</p>
      </div>
      <UsersTable users={list} />
    </div>
  );
}
