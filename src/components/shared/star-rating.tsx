import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  /** Score 0–5 (decimal allowed) */
  value: number;
  /** Total number of stars (default 5) */
  total?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
};

const SIZE_MAP = {
  sm: { star: 'size-3.5', gap: 'gap-0.5', text: 'text-xs' },
  md: { star: 'size-4', gap: 'gap-1', text: 'text-sm' },
  lg: { star: 'size-5', gap: 'gap-1', text: 'text-base' },
} as const;

export function StarRating({
  value,
  total = 5,
  size = 'md',
  showValue = false,
  className,
}: Props) {
  const s = SIZE_MAP[size];
  const clamped = Math.max(0, Math.min(total, value));
  const percent = (clamped / total) * 100;

  return (
    <div className={cn('inline-flex items-center', s.gap, className)}>
      <div
        className="relative inline-flex"
        role="img"
        aria-label={`${clamped.toFixed(1)} trên ${total} sao`}
      >
        {/* Empty stars layer */}
        <div className={cn('flex', s.gap)} aria-hidden>
          {Array.from({ length: total }).map((_, i) => (
            <Star
              key={i}
              className={cn(s.star, 'fill-foreground/15 text-foreground/15')}
              strokeWidth={1.5}
            />
          ))}
        </div>
        {/* Filled stars layer (clipped) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ width: `${percent}%` }}
        >
          <div className={cn('flex', s.gap)}>
            {Array.from({ length: total }).map((_, i) => (
              <Star
                key={i}
                className={cn(s.star, 'fill-amber-400 text-amber-400')}
                strokeWidth={1.5}
              />
            ))}
          </div>
        </div>
      </div>
      {showValue && (
        <span className={cn('ml-1 font-medium tabular-nums', s.text)}>
          {clamped.toFixed(1)}
        </span>
      )}
    </div>
  );
}
