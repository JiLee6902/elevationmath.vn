'use client';

import { Bell, Search, LogOut, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/user/theme-toggle';
import { getInitials } from '@/lib/utils';
import type { User } from '@/lib/db/schema';

export function AdminTopbar({ user }: { user: User }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-sm">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm…"
          className="h-9 rounded-full bg-muted/40 pl-9"
        />
      </div>

      <div className="flex-1" />

      <Link href="/" target="_blank">
        <Button variant="ghost" size="sm">
          <Home className="size-4" />
          Xem site
        </Button>
      </Link>

      <ThemeToggle />

      <Button variant="ghost" size="icon" aria-label="Thông báo">
        <Bell className="size-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-accent">
            <Avatar className="size-7">
              {user.avatarUrl && (
                <AvatarImage src={user.avatarUrl} alt={user.fullName ?? ''} />
              )}
              <AvatarFallback className="text-xs">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium md:inline">
              {user.fullName ?? user.email}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            {user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="size-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
