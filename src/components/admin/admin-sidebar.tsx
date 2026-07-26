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
import { LogoWordmark } from '@/components/user/logo-mark';

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
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
      <Link
        href="/admin"
        className="flex h-16 items-center gap-2 border-b px-4 transition-colors hover:bg-sidebar-accent"
      >
        <LogoWordmark size="sm" className="px-1.5 py-0.5" />
        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          admin
        </span>
      </Link>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
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
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
