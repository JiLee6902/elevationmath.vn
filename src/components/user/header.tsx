'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Menu,
  ChevronDown,
  Target,
  TrendingUp,
  Trophy,
  GraduationCap,
  Layers,
  ClipboardList,
  FileCheck2,
  SunMedium,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/user/theme-toggle';
import { MegaMenu } from '@/components/user/mega-menu';
import { CommandPalette } from '@/components/user/command-palette';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LEVELS, type LevelKey } from '@/lib/constants';
import { cn, groupGradient } from '@/lib/utils';
import type { ProgramGroup, User } from '@/lib/db/schema';
import { LogoWordmark } from './logo-mark';

// Icon gợi ý theo slug nhóm mặc định; nhóm admin thêm mới → icon Layers.
const GROUP_ICONS: Record<string, typeof Target> = {
  'lay-goc': Target,
  'phat-trien': TrendingUp,
  'nang-cao': Trophy,
  'luyen-thi': GraduationCap,
  'de-cuong-on-tap-hoc-ky': ClipboardList,
  'de-kiem-tra-hoc-ky': FileCheck2,
  'tai-lieu-on-tap-he': SunMedium,
};
const groupIcon = (slug: string) => GROUP_ICONS[slug] ?? Layers;

type Props = {
  user: User | null;
  programGroups: ProgramGroup[];
};

export function Header({ user, programGroups }: Props) {
  const [openMenu, setOpenMenu] = React.useState<LevelKey | null>(null);
  const [openGroups, setOpenGroups] = React.useState(false);
  const [openSearch, setOpenSearch] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const groupsRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isAdminUser =
    user?.role === 'admin' || user?.role === 'super_admin';

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // Đóng dropdown nhóm khi click ra ngoài hoặc nhấn Esc
  React.useEffect(() => {
    if (!openGroups) return;
    const onDown = (e: PointerEvent) => {
      if (groupsRef.current && !groupsRef.current.contains(e.target as Node)) {
        setOpenGroups(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenGroups(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [openGroups]);

  // Đóng dropdown nhóm khi chuyển trang
  React.useEffect(() => {
    setOpenGroups(false);
  }, [pathname]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpenSearch(true);
      }
    };
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full backdrop-blur-md transition-all duration-300',
          scrolled
            ? 'bg-background/85 border-b border-border shadow-sm'
            : 'bg-background/60 border-b border-transparent',
        )}
      >
        <div className="container mx-auto flex h-16 items-center gap-5 px-4">
          {/* Logo */}
          <Link href="/" className="shrink-0 focus:outline-none">
            <LogoWordmark />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <NavLink href="/" active={isActive('/')}>
              Trang chủ
            </NavLink>
            {(Object.keys(LEVELS) as LevelKey[]).map((lvl) => {
              const href = `/${LEVELS[lvl].slug}`;
              const active = isActive(href);
              return (
                <div
                  key={lvl}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(lvl)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <NavLink
                    href={href}
                    active={active || openMenu === lvl}
                  >
                    {LEVELS[lvl].name}
                  </NavLink>
                  {openMenu === lvl && (
                    <div className="absolute top-full left-0 pt-2">
                      <div className="overflow-hidden rounded-2xl border bg-popover shadow-xl">
                        <MegaMenu level={lvl} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Nhóm chương trình — category riêng (không thuộc bộ sách) */}
            {programGroups.length > 0 && (
              <div className="relative" ref={groupsRef}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={openGroups}
                  onClick={() => {
                    setOpenMenu(null);
                    setOpenGroups((v) => !v);
                  }}
                  className={cn(
                    'relative inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                    pathname.startsWith('/nhom') || openGroups
                      ? 'text-foreground'
                      : 'text-foreground/70 hover:text-foreground',
                  )}
                >
                  Nhóm chương trình
                  <ChevronDown
                    className={cn(
                      'size-3.5 transition-transform',
                      openGroups && 'rotate-180',
                    )}
                  />
                  {pathname.startsWith('/nhom') && (
                    <span className="absolute left-3 right-6 -bottom-0.5 h-0.5 rounded-full bg-primary" />
                  )}
                </button>
                {openGroups && (
                  <div className="absolute top-full left-0 pt-2">
                    <div className="w-[560px] overflow-hidden rounded-2xl border bg-popover shadow-xl">
                      <div className="flex items-center justify-between px-4 pt-3.5 pb-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                          Khám phá theo mục tiêu học
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-1 p-2 pt-1">
                        {programGroups.map((g) => {
                          const Icon = groupIcon(g.slug);
                          return (
                            <Link
                              key={g.id}
                              href={`/nhom/${g.slug}`}
                              onClick={() => setOpenGroups(false)}
                              className="group/gi flex gap-3 rounded-xl p-3 transition-colors hover:bg-accent"
                            >
                              <span
                                className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-200 group-hover/gi:scale-105"
                                style={{ background: groupGradient(g.color) }}
                              >
                                <Icon className="size-5" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-1 text-sm font-semibold leading-snug">
                                  <span className="truncate">{g.name}</span>
                                  <ChevronDown className="size-3.5 -rotate-90 shrink-0 text-muted-foreground/0 transition-all group-hover/gi:translate-x-0.5 group-hover/gi:text-primary" />
                                </span>
                                {g.description && (
                                  <span className="mt-1 block text-xs leading-snug text-muted-foreground line-clamp-2">
                                    {g.description}
                                  </span>
                                )}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="flex-1" />

          {/* Search trigger — full on sm+, icon-only on mobile */}
          <button
            onClick={() => setOpenSearch(true)}
            className="hidden sm:flex items-center gap-2 h-9 w-56 lg:w-72 rounded-full border bg-muted/40 px-3.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted"
            aria-label="Tìm kiếm"
          >
            <Search className="size-4" />
            <span className="flex-1 text-left">Tìm kiếm tài liệu…</span>
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setOpenSearch(true)}
            aria-label="Tìm kiếm"
          >
            <Search className="size-5" />
          </Button>

          <ThemeToggle />

          {isAdminUser ? (
            <Link href="/admin">
              <Button size="sm">Quản trị</Button>
            </Link>
          ) : !user ? (
            <Link href="/dang-nhap">
              <Button size="sm" variant="default">
                <UserIcon className="size-4" />
                Đăng nhập
              </Button>
            </Link>
          ) : null}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Mở menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 p-4">
                <MobileLink href="/" active={isActive('/')}>
                  Trang chủ
                </MobileLink>
                {(Object.keys(LEVELS) as LevelKey[]).map((lvl) => {
                  const href = `/${LEVELS[lvl].slug}`;
                  return (
                    <MobileLink key={lvl} href={href} active={isActive(href)}>
                      {LEVELS[lvl].name}
                    </MobileLink>
                  );
                })}

                {programGroups.length > 0 && (
                  <>
                    <div className="my-2 h-px bg-border" />
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                      Nhóm chương trình
                    </p>
                    {programGroups.map((g) => (
                      <MobileLink
                        key={g.id}
                        href={`/nhom/${g.slug}`}
                        active={isActive(`/nhom/${g.slug}`)}
                      >
                        {g.name}
                      </MobileLink>
                    ))}
                  </>
                )}

                <div className="my-2 h-px bg-border" />
                {isAdminUser ? (
                  <MobileLink href="/admin" active={isActive('/admin')}>
                    Quản trị
                  </MobileLink>
                ) : !user ? (
                  <MobileLink
                    href="/dang-nhap"
                    active={isActive('/dang-nhap')}
                  >
                    Đăng nhập
                  </MobileLink>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <CommandPalette open={openSearch} onOpenChange={setOpenSearch} />
    </>
  );
}

function MobileLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-foreground/80 hover:bg-accent hover:text-foreground',
      )}
    >
      {children}
    </Link>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'relative px-3 py-2 text-sm font-medium rounded-md transition-colors inline-flex',
        active ? 'text-foreground' : 'text-foreground/70 hover:text-foreground',
        'hover:bg-accent',
      )}
    >
      {children}
      {active && (
        <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />
      )}
    </Link>
  );
}
