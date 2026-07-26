'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { DocCard } from './doc-card';
import { cn } from '@/lib/utils';
import type { Chapter, Document, DocumentType } from '@/lib/db/schema';

type DocWithChapter = Document & {
  chapter?: Pick<Chapter, 'name'> | null;
  documentType?: Pick<DocumentType, 'name'> | null;
};

type Props = {
  title: string;
  docs: DocWithChapter[];
  href?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  className?: string;
};

/**
 * Hàng tài liệu cuộn ngang (carousel) kiểu Scribd/Netflix: hiện ~4 card + lộ
 * nửa card kế, kèm nút ◀ ▶ và vệt mờ mép để báo còn tài liệu để quẹt.
 */
export function DocCarousel({
  title,
  docs,
  href,
  eyebrow,
  icon,
  className,
}: Props) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  const update = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  React.useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update, docs.length]);

  function scrollByDir(dir: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  }

  if (docs.length === 0) return null;

  return (
    <section className={className}>
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <div className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              {icon}
              {eyebrow}
            </div>
          )}
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút cuộn — desktop */}
          <div className="hidden items-center gap-1.5 md:flex">
            <CarouselButton
              dir="prev"
              disabled={atStart}
              onClick={() => scrollByDir(-1)}
            />
            <CarouselButton
              dir="next"
              disabled={atEnd}
              onClick={() => scrollByDir(1)}
            />
          </div>
          {href && (
            <Link
              href={href}
              className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary"
            >
              <span className="relative">
                Xem tất cả
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 left-0 right-0 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100"
                />
              </span>
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="relative mt-4">
        {/* Vệt mờ + báo còn nội dung 2 bên */}
        {!atStart && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent"
          />
        )}
        {!atEnd && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent"
          />
        )}

        <div
          ref={scrollRef}
          onScroll={update}
          className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-2"
        >
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="w-[78%] shrink-0 snap-start sm:w-[46%] md:w-[31%] lg:w-[22%] xl:w-[21.5%]"
            >
              <DocCard doc={doc} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CarouselButton({
  dir,
  disabled,
  onClick,
}: {
  dir: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Cuộn trái' : 'Cuộn phải'}
      className={cn(
        'flex size-8 items-center justify-center rounded-full border bg-card transition-all',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'hover:border-primary/40 hover:bg-accent hover:text-primary',
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
