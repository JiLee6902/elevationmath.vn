'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { LEVELS, type LevelKey } from '@/lib/constants';
import { cn } from '@/lib/utils';

type Props = {
  level: LevelKey;
  grade?: number;
};

export function SubNav({ level, grade }: Props) {
  const config = LEVELS[level];

  return (
    <div className="sticky top-14 z-20 border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-12 items-center justify-between gap-4 px-4">
        {/* Segmented grades — scroll fade on edges */}
        <div className="relative flex-1 min-w-0">
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-card to-transparent"
          />
          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto pr-6">
            {config.grades.map((g) => {
              const active = g === grade;
              const target = `/${config.slug}/lop-${g}`;
              return (
                <Link
                  key={g}
                  href={target}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  Lớp {g}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Breadcrumb (compact) */}
        <nav
          aria-label="Breadcrumb"
          className="hidden shrink-0 items-center text-sm text-muted-foreground md:flex"
        >
          <Link
            href={`/${config.slug}`}
            className="transition-colors hover:text-foreground"
          >
            {config.name}
          </Link>
          {grade && (
            <>
              <ChevronRight className="mx-1 size-3.5 opacity-40" />
              <Link
                href={`/${config.slug}/lop-${grade}`}
                className="transition-colors hover:text-foreground"
              >
                Lớp {grade}
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
