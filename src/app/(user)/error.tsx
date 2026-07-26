'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UserError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-32 max-w-md text-center">
      <div className="size-12 mx-auto rounded-xl bg-destructive/10 flex items-center justify-center mb-5">
        <AlertTriangle className="size-5 text-destructive" />
      </div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Đã có lỗi xảy ra
      </h1>
      <p className="text-muted-foreground mt-3">
        {error.message?.length && error.message.length < 200
          ? error.message
          : 'Có gì đó không ổn ở phía chúng tôi. Vui lòng thử lại sau.'}
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground mt-2 font-mono">
          {error.digest}
        </p>
      )}
      <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
        <Button onClick={reset}>
          <RefreshCw className="size-4" />
          Thử lại
        </Button>
        <Link href="/">
          <Button variant="ghost">
            <Home className="size-4" />
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
