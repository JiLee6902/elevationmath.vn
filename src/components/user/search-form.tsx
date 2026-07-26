'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, Loader2, ArrowRight } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import type { Document } from '@/lib/db/schema';

/**
 * Ô tìm kiếm có gợi ý tài liệu khi gõ (sắp theo lượt tải nhiều nhất).
 * Enter / nút "Tìm" → /tim-kiem?q=...; chọn gợi ý → mở thẳng tài liệu.
 */
export function SearchForm({
  defaultValue = '',
  autoFocus = false,
  placeholder = 'Tìm tài liệu, đề thi, chuyên đề…',
  className,
}: {
  defaultValue?: string;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState(defaultValue);
  const [results, setResults] = React.useState<Document[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const rootRef = React.useRef<HTMLDivElement>(null);

  // Debounce + fetch gợi ý
  React.useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: ctrl.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
          setOpen(true);
          setActive(-1);
        }
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  // Đóng khi click ra ngoài
  React.useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  function submit(q: string) {
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/tim-kiem?q=${encodeURIComponent(term)}`);
  }

  function openDoc(slug: string) {
    setOpen(false);
    router.push(`/tai-lieu/${slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a <= 0 ? results.length - 1 : a - 1));
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      openDoc(results[active].slug);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <form
        action="/tim-kiem"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="flex h-14 w-full items-center gap-2 rounded-full border bg-card pl-5 pr-2 shadow-sm transition-all focus-within:border-primary/50 focus-within:shadow-md"
      >
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <input
          type="search"
          name="q"
          value={query}
          autoFocus={autoFocus}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground md:text-base"
        />
        {loading && (
          <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
        )}
        <button
          type="submit"
          className="shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
        >
          Tìm
        </button>
      </form>

      {/* Dropdown gợi ý */}
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-popover py-1.5 text-left shadow-xl">
          {results.map((d, i) => {
            return (
              <button
                key={d.id}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => openDoc(d.slug)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                  i === active ? 'bg-accent' : 'hover:bg-accent',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br font-display text-xs font-bold text-white shadow-sm',
                    'from-primary to-sky-600',
                  )}
                >
                  L{d.grade}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {d.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Lớp {d.grade}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground">
                  <Download className="size-3.5" />
                  {formatNumber(d.downloadCount)}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => submit(query)}
            className="mt-1 flex w-full items-center gap-2 border-t px-4 py-2.5 text-left text-sm font-medium text-primary transition-colors hover:bg-accent"
          >
            <Search className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">
              Xem tất cả kết quả cho “{query.trim()}”
            </span>
            <ArrowRight className="size-3.5 shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
}
