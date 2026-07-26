'use client';

import * as React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterPanel } from './filter-panel';
import { DIFFICULTIES } from '@/lib/constants';
import { cn, formatNumber } from '@/lib/utils';
import type { DocumentType } from '@/lib/db/schema';

type Props = { total: number; documentTypes: DocumentType[] };

const FILTER_KEYS = ['type', 'difficulty'] as const;

function parseCsv(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến' },
  { value: 'top_rated', label: 'Đánh giá cao' },
] as const;

export function FilterToolbar({ total, documentTypes }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const activeTypes = parseCsv(params.get('type'));
  const activeDifficulties = parseCsv(params.get('difficulty'));
  const sort = params.get('sort') ?? 'newest';

  const activeCount =
    activeTypes.length +
    activeDifficulties.length;

  function removeValue(key: string, value: string) {
    const current = parseCsv(params.get(key));
    const next = current.filter((v) => v !== value);
    const sp = new URLSearchParams(params.toString());
    if (next.length === 0) sp.delete(key);
    else sp.set(key, next.join(','));
    sp.delete('page');
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function setSort(value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value === 'newest') sp.delete('sort');
    else sp.set('sort', value);
    sp.delete('page');
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function clearAll() {
    const sp = new URLSearchParams(params.toString());
    FILTER_KEYS.forEach((k) => sp.delete(k));
    sp.delete('page');
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-2 flex-wrap">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn('lg:hidden', activeCount > 0 && 'border-primary/40')}
            >
              <SlidersHorizontal className="size-4" />
              Bộ lọc
              {activeCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
            <SheetHeader className="border-b">
              <SheetTitle>Bộ lọc</SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1 p-4">
              <FilterPanel documentTypes={documentTypes} />
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <span className="text-sm text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">
            {formatNumber(total)}
          </span>{' '}
          tài liệu
        </span>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Sắp xếp
          </span>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger size="sm" className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeTypes.map((t) => (
            <FilterChip
              key={`t-${t}`}
              label={documentTypes.find((type) => type.id === t)?.name ?? 'Loại tài liệu'}
              onRemove={() => removeValue('type', t)}
            />
          ))}
          {activeDifficulties.map((d) => (
            <FilterChip
              key={`d-${d}`}
              label={DIFFICULTIES[d as keyof typeof DIFFICULTIES]?.name ?? d}
              onRemove={() => removeValue('difficulty', d)}
            />
          ))}
          <button
            onClick={clearAll}
            className="ml-1 text-xs font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-2.5 pr-1 text-xs font-medium text-primary">
      {label}
      <button
        onClick={onRemove}
        className="inline-flex size-4 items-center justify-center rounded-full transition-colors hover:bg-primary/20"
        aria-label={`Bỏ ${label}`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
