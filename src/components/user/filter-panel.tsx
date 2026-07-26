'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import { DIFFICULTIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { DocumentType } from '@/lib/db/schema';

function parseCsv(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function FilterPanel({ documentTypes }: { documentTypes: DocumentType[] }) {
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
        {documentTypes.map((type) => (
          <CheckRow
            key={type.id}
            checked={activeTypes.includes(type.id)}
            onClick={() => setMulti('type', toggleValue(activeTypes, type.id))}
          >
            {type.name}
          </CheckRow>
        ))}
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
