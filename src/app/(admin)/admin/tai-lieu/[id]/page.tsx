import { notFound } from 'next/navigation';
import { DocForm } from '@/components/admin/doc-form';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import {
  getChapters,
  getDifficultyLevels,
  getDocumentById,
  getDocumentTypes,
  getProgramGroups,
} from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [doc, chapters, groups, documentTypes, difficultyLevels] = await Promise.all([
    getDocumentById(id).catch(() => null),
    getChapters({}).catch(() => []),
    getProgramGroups(true).catch(() => []),
    getDocumentTypes({ includeHidden: true }).catch(() => []),
    getDifficultyLevels(true).catch(() => []),
  ]);
  if (!doc) notFound();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Tài liệu"
        title="Sửa tài liệu"
        description={doc.title}
      />
      <DocForm
        doc={doc}
        chapters={chapters}
        programGroups={groups}
        documentTypes={documentTypes}
        difficultyLevels={difficultyLevels}
      />
    </div>
  );
}
