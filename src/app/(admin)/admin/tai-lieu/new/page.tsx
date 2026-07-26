import { DocForm } from '@/components/admin/doc-form';
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
      <div>
        <h1 className="text-2xl font-semibold">Tạo tài liệu</h1>
        <p className="text-sm text-muted-foreground">
          Upload file và nhập thông tin chi tiết
        </p>
      </div>
      <DocForm
        chapters={chapters}
        programGroups={groups}
        documentTypes={documentTypes}
      />
    </div>
  );
}
