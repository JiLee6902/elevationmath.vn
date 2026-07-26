import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

type Item = { label: string; href?: string };

export function Breadcrumb({
  items,
  className,
  light = false,
}: {
  items: Item[];
  className?: string;
  /** Trên nền màu (hero): chữ trắng thay vì tối. */
  light?: boolean;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center text-sm flex-wrap gap-y-1',
        light ? 'text-white/70' : 'text-muted-foreground',
        className,
      )}
    >
      {items.map((item, i) => {
        const isFirst = i === 0;
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center min-w-0">
            {i > 0 && (
              <ChevronRight className="size-3.5 mx-1 opacity-40 shrink-0" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-1 transition-colors min-w-0',
                  light ? 'hover:text-white' : 'hover:text-foreground',
                  isFirst && 'shrink-0',
                )}
              >
                {isFirst && item.href === '/' && (
                  <Home className="size-3.5 shrink-0" />
                )}
                <span className="truncate">{item.label}</span>
              </Link>
            ) : (
              <span
                className={cn(
                  'font-medium truncate',
                  light ? 'text-white' : 'text-foreground',
                  isLast && 'max-w-[40ch]',
                )}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
