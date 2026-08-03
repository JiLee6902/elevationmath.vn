import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { documentTypes } from '@/lib/db/schema';
import { DocumentTypesClient } from './document-types-client';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const list = await db
    .select()
    .from(documentTypes)
    .orderBy(asc(documentTypes.level), asc(documentTypes.grade), asc(documentTypes.order))
    .catch(() => []);
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Loại tài liệu</h1>
        <p className="text-sm text-muted-foreground">
          Tạo loại tài liệu theo từng lớp. Khi tạo tài liệu, admin chỉ thấy các
          loại đã gắn cho cấp/lớp đang chọn.
        </p>
      </div>
      <DocumentTypesClient documentTypes={list} />
    </div>
  );
}
