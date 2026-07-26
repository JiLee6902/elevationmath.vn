import { type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn, formatNumber } from '@/lib/utils';

type Props = {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  hint?: string;
  className?: string;
};

export function StatCard({ title, value, icon: Icon, trend, hint, className }: Props) {
  return (
    <Card
      className={cn(
        'p-5 transition-all hover:-translate-y-1 hover:shadow-lg',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
            {formatNumber(value)}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
      {trend && (
        <p
          className={cn(
            'mt-3 text-xs font-medium',
            trend.positive
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400',
          )}
        >
          {trend.positive ? '+' : ''}
          {trend.value}% so với tháng trước
        </p>
      )}
    </Card>
  );
}
