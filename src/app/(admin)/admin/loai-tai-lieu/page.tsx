import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { documentTypes } from '@/lib/db/schema';
import { getDocumentCategories } from '@/lib/db/queries';
import { DocumentTypesClient } from './document-types-client';
import { AdminPageHeader } from '@/components/admin/admin-page-header';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [list, categories] = await Promise.all([
    db
      .select()
      .from(documentTypes)
      .orderBy(asc(documentTypes.level), asc(documentTypes.grade), asc(documentTypes.order))
      .catch(() => []),
    getDocumentCategories(true).catch(() => []),
  ]);
  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        eyebrow="Phân loại"
        title="Loại tài liệu"
        description="Quản lý loại tài liệu và gắn cho nhiều lớp. Khi tạo tài liệu, admin chỉ thấy các loại đã gắn cho cấp/lớp đang chọn."
      />
      <DocumentTypesClient documentTypes={list} categories={categories} />
    </div>
  );
}
