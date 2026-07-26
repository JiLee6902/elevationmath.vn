'use client';

import Link from 'next/link';
import { ArrowRight, Clock3, TrendingUp } from 'lucide-react';
import { LEVELS, type LevelKey } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { LEVEL_VISUALS } from './level-visuals';

export function MegaMenu({ level }: { level: LevelKey }) {
  const config = LEVELS[level];
  const visual = LEVEL_VISUALS[level];
  const middleGrade = config.grades[Math.floor(config.grades.length / 2)];

  return (
    <div className="w-[460px] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.16em]',
              visual.accent,
            )}
          >
            {config.name}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Chọn lớp
          </h2>
        </div>
        <Link
          href={`/${config.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Xem tất cả
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {config.grades.map((grade) => (
          <Link
            key={grade}
            href={`/${config.slug}/lop-${grade}`}
            className="group flex items-center justify-between rounded-xl border border-border/80 bg-card px-4 py-3.5 transition-colors hover:border-primary/30 hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex items-center gap-3">
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg text-sm font-semibold',
                  visual.blob,
                  visual.accent,
                )}
              >
                {grade}
              </span>
              <span>
                <span className="block text-sm font-semibold">Lớp {grade}</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  Tài liệu Toán
                </span>
              </span>
            </span>
            <ArrowRight className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4">
        <QuickLink
          href={`/${config.slug}/lop-${middleGrade}?sort=newest`}
          icon={Clock3}
          label="Mới cập nhật"
        />
        <QuickLink
          href={`/${config.slug}/lop-${middleGrade}?sort=popular`}
          icon={TrendingUp}
          label="Phổ biến"
        />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Clock3;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icon className="size-4 text-primary" />
      <span className="flex-1">{label}</span>
      <ArrowRight className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
    </Link>
  );
}
