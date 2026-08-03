import { DocForm } from '@/components/admin/doc-form';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { getChapters, getDocumentTypes, getProgramGroups } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [chapters, groups, documentTypes] = await Promise.all([
    getChapters({}).catch(() => []),
    getProgramGroups(true).catch(() => []),
    getDocumentTypes({ includeHidden: true }).catch(() => []),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Tài liệu"
        title="Tạo tài liệu"
        description="Upload file, nhập metadata và phân loại tài liệu trước khi hiển thị ngoài website."
      />
      <DocForm
        chapters={chapters}
        programGroups={groups}
        documentTypes={documentTypes}
      />
    </div>
  );
}
