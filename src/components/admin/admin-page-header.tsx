import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function AdminPageHeader({
  eyebrow = 'Admin',
  title,
  description,
  action,
  className,
}: Props) {
  return (
    <section
      className={cn(
        'rounded-3xl border bg-card/80 p-5 shadow-sm backdrop-blur md:p-6',
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h1>
          {description && (
            <div className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </div>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </section>
  );
}
