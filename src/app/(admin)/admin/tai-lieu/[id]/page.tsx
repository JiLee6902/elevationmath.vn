import { notFound } from 'next/navigation';
import { DocForm } from '@/components/admin/doc-form';
import {
  getChapters,
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
  const [doc, chapters, groups, documentTypes] = await Promise.all([
    getDocumentById(id).catch(() => null),
    getChapters({}).catch(() => []),
    getProgramGroups(true).catch(() => []),
    getDocumentTypes({ includeHidden: true }).catch(() => []),
  ]);
  if (!doc) notFound();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sửa tài liệu</h1>
        <p className="text-sm text-muted-foreground">{doc.title}</p>
      </div>
      <DocForm
        doc={doc}
        chapters={chapters}
        programGroups={groups}
        documentTypes={documentTypes}
      />
    </div>
  );
}
