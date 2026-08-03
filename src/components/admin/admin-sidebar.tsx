'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Inbox,
  Users,
  Layers,
  Tags,
  ListTree,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoMark } from '@/components/user/logo-mark';

const ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/tai-lieu', label: 'Tài liệu', icon: FileText },
  { href: '/admin/tai-lieu/pending', label: 'Duyệt bài', icon: Inbox },
  { href: '/admin/nguoi-dung', label: 'Người dùng', icon: Users },
  { href: '/admin/nhom', label: 'Nhóm chương trình', icon: Layers },
  { href: '/admin/loai-tai-lieu', label: 'Loại tài liệu', icon: Tags },
  { href: '/admin/chuong', label: 'Chương', icon: ListTree },
  { href: '/admin/thong-ke', label: 'Thống kê', icon: BarChart3 },
  { href: '/admin/cai-dat', label: 'Cài đặt', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r bg-sidebar/95 text-sidebar-foreground shadow-[12px_0_40px_-32px_rgba(15,23,42,0.55)] backdrop-blur lg:flex">
      <Link
        href="/admin"
        className="flex h-20 min-w-0 items-center gap-3 border-b px-4 transition-colors hover:bg-sidebar-accent"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-[0_12px_28px_rgba(45,43,127,0.14),0_1px_5px_rgba(249,173,34,0.10)] ring-1 ring-[#2d2b7f]/10">
          <LogoMark size="sm" />
          <span className="min-w-0 truncate text-sm font-semibold text-[#2d2b7f]">
            Elevation Math
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          admin
        </span>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-primary text-primary-foreground shadow-[0_10px_26px_-18px_color-mix(in_oklch,var(--primary)_80%,black)]'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                  active
                    ? 'bg-white/15 text-primary-foreground'
                    : 'bg-muted/60 text-muted-foreground group-hover:bg-background group-hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-xs text-primary">
          <p className="font-semibold">Admin workspace</p>
          <p className="mt-1 text-primary/75">
            Quản lý nội dung, tài liệu và dữ liệu hệ thống.
          </p>
        </div>
      </div>
    </aside>
  );
}
