import { db } from '@/lib/db';
import { programGroups } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { ProgramGroupsClient } from './program-groups-client';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const list = await db
    .select()
    .from(programGroups)
    .orderBy(asc(programGroups.order), asc(programGroups.name))
    .catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nhóm chương trình</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý các nhóm tài liệu theo mục tiêu (lấy gốc, phát triển, nâng
          cao, luyện thi…). Thêm/sửa/ẩn tuỳ ý — không cố định trong code.
        </p>
      </div>
      <ProgramGroupsClient groups={list} />
    </div>
  );
}
