'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Thanh progress mảnh ở đỉnh trang, animate khi user chuyển route.
 * Khi pathname/search params thay đổi → fade thanh đi (báo đã chuyển xong).
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = React.useState(false);
  const [width, setWidth] = React.useState(0);

  // Bắt mọi click vào <a> hoặc <Link>: bắt đầu progress
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const a = target.closest<HTMLAnchorElement>('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      // External
      if (href.startsWith('http') && !href.startsWith(location.origin)) return;
      // Modifier keys, target=_blank
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        a.target === '_blank'
      )
        return;
      setActive(true);
      setWidth(20);
    }
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, []);

  // Animate progress khi active
  React.useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setWidth((w) => (w < 90 ? w + (90 - w) * 0.05 : w));
    }, 200);
    return () => window.clearInterval(id);
  }, [active]);

  // Khi route đã đổi → finish + reset
  React.useEffect(() => {
    if (!active) return;
    setWidth(100);
    const id = window.setTimeout(() => {
      setActive(false);
      setWidth(0);
    }, 250);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden
      className="fixed left-0 right-0 top-0 z-[100] h-0.5 pointer-events-none"
    >
      <div
        className="h-full bg-primary shadow-[0_0_8px_2px_var(--primary)] transition-all"
        style={{
          width: `${width}%`,
          opacity: active ? 1 : 0,
          transitionDuration: active ? '200ms' : '500ms',
        }}
      />
    </div>
  );
}
