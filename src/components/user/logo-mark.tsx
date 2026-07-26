import Image from 'next/image';
import { cn } from '@/lib/utils';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZES = {
  sm: 28,
  md: 36,
  lg: 48,
} as const;

export function LogoMark({ size = 'md', className }: Props) {
  const px = SIZES[size];
  return (
    <Image
      src="/brand/elevation-math-mark.png"
      alt=""
      width={px}
      height={Math.round(px * 94 / 82)}
      className={cn('shrink-0 rounded-md object-contain', className)}
    />
  );
}

export function LogoWordmark({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const height = size === 'sm' ? 30 : size === 'lg' ? 48 : 38;
  const width = Math.round(height * 573 / 128);

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-xl bg-white px-2.5 py-1 shadow-[0_7px_18px_rgba(45,43,127,0.12),0_1px_5px_rgba(249,173,34,0.10)] ring-1 ring-[#2d2b7f]/10',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(45,43,127,0.16),0_2px_8px_rgba(249,173,34,0.12)]',
        className,
      )}
    >
      <Image
        src="/brand/elevation-math-wordmark.png"
        alt="Elevation Math"
        width={width}
        height={height}
        priority
        className="h-auto w-auto object-contain"
      />
    </span>
  );
}
