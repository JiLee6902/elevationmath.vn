'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  page: number;
  totalPages: number;
  className?: string;
};

export function Pagination({ page, totalPages, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  if (totalPages <= 1) return null;

  function go(p: number) {
    const sp = new URLSearchParams(params.toString());
    if (p <= 1) sp.delete('page');
    else sp.set('page', String(p));
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const items = pageItems(page, totalPages);

  return (
    <nav
      aria-label="Phân trang"
      className={cn('flex items-center justify-center gap-1.5', className)}
    >
      <Button
        variant="outline"
        size="icon"
        className="size-9"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="Trang trước"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {items.map((it, i) =>
        it === '…' ? (
          <span
            key={`gap-${i}`}
            className="size-9 inline-flex items-center justify-center text-muted-foreground"
          >
            <MoreHorizontal className="size-4" />
          </span>
        ) : (
          <Button
            key={it}
            variant={it === page ? 'default' : 'outline'}
            size="icon"
            className="size-9 tabular-nums"
            onClick={() => go(it)}
            aria-current={it === page ? 'page' : undefined}
          >
            {it}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        className="size-9"
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        aria-label="Trang sau"
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}

function pageItems(page: number, total: number): Array<number | '…'> {
  const items: Array<number | '…'> = [];
  const window = 1;
  const start = Math.max(2, page - window);
  const end = Math.min(total - 1, page + window);

  items.push(1);
  if (start > 2) items.push('…');
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push('…');
  if (total > 1) items.push(total);
  return items;
}
