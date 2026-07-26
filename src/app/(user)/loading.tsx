import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
        <Loader2 className="size-10 animate-spin text-primary relative" />
      </div>
      <p className="mt-6 text-base font-medium">Đang tải…</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Vui lòng chờ trong giây lát
      </p>
    </div>
  );
}
