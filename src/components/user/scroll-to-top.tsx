'use client';

import * as React from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScrollToTop() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <button
      type="button"
      onClick={scrollTop}
      aria-label="Lên đầu trang"
      className={cn(
        'fixed z-30 right-4 lg:right-6 size-11 rounded-full',
        'bg-card border shadow-lg shadow-foreground/10',
        'text-foreground hover:text-primary hover:border-primary/30',
        'flex items-center justify-center',
        'transition-all duration-300',
        // Đặt cao hơn mobile sticky bar (lg:bottom-6 vì lg trở lên ko có bar)
        'bottom-[max(5rem,calc(env(safe-area-inset-bottom)+5rem))] lg:bottom-6',
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none',
      )}
    >
      <ArrowUp className="size-4" />
    </button>
  );
}
