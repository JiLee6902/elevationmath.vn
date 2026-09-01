'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import { DIFFICULTIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { DocumentCategory, DocumentType } from '@/lib/db/schema';

function parseCsv(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function FilterPanel({
  documentTypes,
  categories = [],
}: {
  documentTypes: DocumentType[];
  categories?: DocumentCategory[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const activeTypes = parseCsv(params.get('type'));
  const activeDifficulties = parseCsv(params.get('difficulty'));

  function setMulti(key: string, next: string[]) {
    const sp = new URLSearchParams(params.toString());
    if (next.length === 0) sp.delete(key);
    else sp.set(key, next.join(','));
    sp.delete('page');
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  // Gom loại tài liệu theo nhóm cha (giữ thứ tự nhóm), phần chưa gán nhóm
  // rơi vào "Khác".
  const grouped = categories
    .map((cat) => ({
      cat,
      types: documentTypes.filter((t) => t.categoryId === cat.id),
    }))
    .filter((g) => g.types.length > 0);
  const categoryIds = new Set(categories.map((c) => c.id));
  const uncategorized = documentTypes.filter(
    (t) => !t.categoryId || !categoryIds.has(t.categoryId),
  );

  const renderTypeRow = (type: DocumentType) => (
    <CheckRow
      key={type.id}
      checked={activeTypes.includes(type.id)}
      onClick={() => setMulti('type', toggleValue(activeTypes, type.id))}
    >
      {type.name}
    </CheckRow>
  );

  return (
    <div className="space-y-6">
      <Section
        title="Loại tài liệu"
        action={
          activeTypes.length > 0 ? (
            <ClearButton onClick={() => setMulti('type', [])} />
          ) : null
        }
      >
        {grouped.length > 0 ? (
          <div className="space-y-3">
            {grouped.map(({ cat, types }) => (
              <div key={cat.id}>
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/50">
                  {cat.name}
                </p>
                <div className="space-y-0.5">{types.map(renderTypeRow)}</div>
              </div>
            ))}
            {uncategorized.length > 0 && (
              <div>
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/50">
                  Khác
                </p>
                <div className="space-y-0.5">
                  {uncategorized.map(renderTypeRow)}
                </div>
              </div>
            )}
          </div>
        ) : (
          documentTypes.map(renderTypeRow)
        )}
      </Section>

      <Section
        title="Mức độ"
        action={
          activeDifficulties.length > 0 ? (
            <ClearButton onClick={() => setMulti('difficulty', [])} />
          ) : null
        }
      >
        {Object.entries(DIFFICULTIES).map(([key, d]) => (
          <CheckRow
            key={key}
            checked={activeDifficulties.includes(key)}
            onClick={() =>
              setMulti('difficulty', toggleValue(activeDifficulties, key))
            }
          >
            {d.name}
          </CheckRow>
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </p>
        {action}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function CheckRow({
  checked,
  onClick,
  children,
}: {
  checked: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      role="checkbox"
      aria-checked={checked}
      className={cn(
        'group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
        checked
          ? 'bg-primary/10 font-medium text-primary'
          : 'text-foreground/80 hover:bg-accent hover:text-foreground',
      )}
    >
      <span
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
          checked
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-input bg-background group-hover:border-primary/40',
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span className="flex-1 min-w-0">{children}</span>
    </button>
  );
}

function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[10px] font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      Xóa
    </button>
  );
}
