import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
        <Loader2 className="size-10 animate-spin text-primary relative" />
      </div>
      <p className="mt-6 text-base font-medium">Đang tải…</p>
    </div>
  );
}
