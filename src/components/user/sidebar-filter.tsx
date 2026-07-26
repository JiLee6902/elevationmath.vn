import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterPanel } from './filter-panel';
import type { DocumentType } from '@/lib/db/schema';

export function SidebarFilter({ documentTypes }: { documentTypes: DocumentType[] }) {
  return (
    <aside className="hidden w-[260px] shrink-0 lg:block">
      <div className="sticky top-[6.5rem]">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          Bộ lọc
        </p>
        <ScrollArea className="h-[calc(100vh-8.5rem)] pr-2">
          <FilterPanel documentTypes={documentTypes} />
        </ScrollArea>
      </div>
    </aside>
  );
}
