import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminTopbarSkeleton() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <div className="relative max-w-xl flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Tìm kiếm…" className="h-10 rounded-2xl bg-muted/40 pl-9" />
      </div>
      <div className="flex-1" />
      <Skeleton className="size-8 rounded-md" />
      <Skeleton className="size-8 rounded-md" />
      <Skeleton className="size-8 rounded-md" />
      <Skeleton className="size-8 rounded-md" />
    </header>
  );
}
