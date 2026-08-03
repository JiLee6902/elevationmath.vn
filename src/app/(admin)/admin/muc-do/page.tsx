import { asc } from 'drizzle-orm';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { db } from '@/lib/db';
import { difficultyLevels } from '@/lib/db/schema';
import { DifficultyLevelsClient } from './difficulty-levels-client';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const list = await db
    .select()
    .from(difficultyLevels)
    .orderBy(asc(difficultyLevels.order), asc(difficultyLevels.name))
    .catch(() => []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Phân loại"
        title="Mức độ"
        description="Quản lý tên hiển thị, màu sắc, thứ tự và trạng thái của mức độ tài liệu. Key kỹ thuật được giữ cố định để bảo toàn dữ liệu cũ."
      />
      <DifficultyLevelsClient levels={list} />
    </div>
  );
}
