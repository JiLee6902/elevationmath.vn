'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { LEVELS, type LevelKey } from '@/lib/constants';
import type { Document } from '@/lib/db/schema';
import { Search, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandPalette({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<Document[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
          { signal: ctrl.signal },
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  function submitSearch() {
    const term = query.trim();
    if (term.length < 1) return;
    go(`/tim-kiem?q=${encodeURIComponent(term)}`);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Tìm kiếm"
      description="Tìm tài liệu và lớp học"
    >
      <CommandInput
        placeholder="Tìm tài liệu hoặc lớp học…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? 'Đang tìm…' : 'Không tìm thấy kết quả nhanh.'}
        </CommandEmpty>

        {query.trim().length > 0 && (
          <CommandGroup>
            <CommandItem
              value={`__search__${query}`}
              onSelect={submitSearch}
              className="font-medium text-primary"
            >
              <Search className="size-4" />
              <span className="min-w-0 flex-1 truncate">
                Xem tất cả kết quả cho “{query.trim()}”
              </span>
              <ArrowRight className="ml-auto size-3.5" />
            </CommandItem>
          </CommandGroup>
        )}

        {!query && (
          <>
            <CommandGroup heading="Đề xuất">
              <CommandItem onSelect={() => go('/tim-kiem')}>
                <Search className="size-4" />
                Tìm kiếm tài liệu
              </CommandItem>
              <CommandItem onSelect={() => go('/thcs/lop-7')}>
                <BookOpen className="size-4" />
                Tài liệu Toán 7
              </CommandItem>
              <CommandItem onSelect={() => go('/thpt/lop-12')}>
                <GraduationCap className="size-4" />
                Toán 12 — luyện thi
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Cấp · Lớp">
              {(Object.keys(LEVELS) as LevelKey[]).map((lvl) =>
                LEVELS[lvl].grades.map((g) => (
                    <CommandItem
                      key={`${lvl}-${g}`}
                      value={`${LEVELS[lvl].name} lớp ${g}`}
                      onSelect={() => go(`/${LEVELS[lvl].slug}/lop-${g}`)}
                    >
                      {LEVELS[lvl].name} · Lớp {g}
                    </CommandItem>
                  ),
                )
              )}
            </CommandGroup>
          </>
        )}

        {query && results.length > 0 && (
          <CommandGroup heading="Tài liệu">
            {results.map((doc) => {
              return (
                <CommandItem
                  key={doc.id}
                  value={doc.title}
                  onSelect={() => go(`/tai-lieu/${doc.slug}`)}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br font-display text-[11px] font-bold text-white shadow-sm',
                      'from-primary to-sky-600',
                    )}
                  >
                    L{doc.grade}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{doc.title}</span>
                    <span className="text-xs text-muted-foreground">
                      Lớp {doc.grade}
                    </span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
