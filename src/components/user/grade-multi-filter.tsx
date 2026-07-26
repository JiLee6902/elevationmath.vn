'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, SlidersHorizontal, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Opt = { grade: number; count: number };
type Block = { levelName: string; grades: Opt[] };

/**
 * Dropdown lọc theo lớp — đa chọn (checkbox) nhóm theo khối.
 * Áp dụng khi bấm "Áp dụng" hoặc khi đóng popover.
 */
export function GradeMultiFilter({
  blocks,
  selected,
  base,
  sort,
}: {
  blocks: Block[];
  selected: number[];
  base: string;
  sort: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [sel, setSel] = React.useState<Set<number>>(new Set(selected));
  const ref = React.useRef<HTMLDivElement>(null);
  const selKey = selected.join(',');

  // Đồng bộ lại khi URL đổi (sau điều hướng)
  React.useEffect(() => {
    setSel(new Set(selected));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selKey]);

  const apply = React.useCallback(
    (next: Set<number>) => {
      const arr = [...next].sort((a, b) => a - b);
      const q = new URLSearchParams();
      if (arr.length) q.set('grade', arr.join(','));
      if (sort !== 'newest') q.set('sort', sort);
      const s = q.toString();
      setOpen(false);
      router.push(s ? `${base}?${s}` : base);
    },
    [base, sort, router],
  );

  // Đóng khi click ngoài / Esc → áp dụng lựa chọn hiện tại
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) apply(sel);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open, sel, apply]);

  function toggle(g: number) {
    setSel((prev) => {
      const n = new Set(prev);
      if (n.has(g)) n.delete(g);
      else n.add(g);
      return n;
    });
  }

  const count = selected.length;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
          count > 0
            ? 'border-primary/40 bg-primary/5 text-primary'
            : 'bg-card text-foreground/80 hover:border-primary/40',
        )}
      >
        <SlidersHorizontal className="size-4" />
        Lọc theo lớp
        {count > 0 ? (
          <span className="rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground tabular-nums">
            {count}
          </span>
        ) : (
          <span className="text-muted-foreground">· Tất cả</span>
        )}
        <ChevronDown
          className={cn(
            'size-4 transition-transform',
            count > 0 ? 'text-primary' : 'text-muted-foreground',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-[340px] rounded-2xl border bg-popover p-3 shadow-xl">
          {blocks.map((b) => (
            <div key={b.levelName} className="mb-2 last:mb-0">
              <p className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {b.levelName}
              </p>
              <div className="grid grid-cols-3 gap-1">
                {b.grades.map((g) => {
                  const on = sel.has(g.grade);
                  return (
                    <button
                      key={g.grade}
                      type="button"
                      onClick={() => toggle(g.grade)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors',
                        on
                          ? 'border-primary bg-primary/10 text-primary'
                          : g.count === 0
                            ? 'border-transparent text-muted-foreground/50 hover:bg-accent'
                            : 'border-transparent hover:bg-accent',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-4 shrink-0 items-center justify-center rounded border',
                          on
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border',
                        )}
                      >
                        {on && <Check className="size-3" />}
                      </span>
                      <span className="flex-1 text-left">Lớp {g.grade}</span>
                      <span className="text-xs tabular-nums opacity-60">
                        {g.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-2 flex items-center justify-between gap-2 border-t pt-2.5">
            <button
              type="button"
              onClick={() => apply(new Set())}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Xoá lọc
            </button>
            <button
              type="button"
              onClick={() => apply(sel)}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Áp dụng{sel.size > 0 ? ` (${sel.size})` : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
