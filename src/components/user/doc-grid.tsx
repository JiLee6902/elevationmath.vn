import { DocCard } from './doc-card';
import { EmptyState } from '@/components/shared/empty-state';
import { FileQuestion } from 'lucide-react';
import type { Chapter, Document, DocumentType } from '@/lib/db/schema';

type DocWithChapter = Document & {
  chapter?: Pick<Chapter, 'name'> | null;
  documentType?: Pick<DocumentType, 'name'> | null;
};

export function DocGrid({
  docs,
  emptyState,
}: {
  docs: DocWithChapter[];
  emptyState?: React.ReactNode;
}) {
  if (docs.length === 0) {
    return (
      emptyState ?? (
        <EmptyState
          icon={FileQuestion}
          title="Chưa có tài liệu nào"
          description="Hãy thử bộ lọc khác hoặc upload tài liệu của bạn để chia sẻ với cộng đồng."
        />
      )
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {docs.map((doc) => (
        <li key={doc.id}>
          <DocCard doc={doc} />
        </li>
      ))}
    </ul>
  );
}
