import { db } from '@/lib/db';
import { programGroups } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { ProgramGroupsClient } from './program-groups-client';
import { AdminPageHeader } from '@/components/admin/admin-page-header';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const list = await db
    .select()
    .from(programGroups)
    .orderBy(asc(programGroups.order), asc(programGroups.name))
    .catch(() => []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Phân nhóm"
        title="Nhóm chương trình"
        description="Quản lý các nhóm tài liệu theo mục tiêu: lấy gốc, phát triển, nâng cao, luyện thi… Thêm/sửa/ẩn tuỳ ý — không cố định trong code."
      />
      <ProgramGroupsClient groups={list} />
    </div>
  );
}
