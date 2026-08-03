import { db } from '@/lib/db';
import { chapters } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { ChaptersClient } from './chapters-client';
import { AdminPageHeader } from '@/components/admin/admin-page-header';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const list = await db
    .select()
    .from(chapters)
    .orderBy(asc(chapters.level), asc(chapters.grade), asc(chapters.number))
    .catch(() => []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cấu trúc học tập"
        title="Chương"
        description="Quản lý chương theo cấp học và lớp để form tạo tài liệu lọc đúng nội dung."
      />
      <ChaptersClient chapters={list} />
    </div>
  );
}
