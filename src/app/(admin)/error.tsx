'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="p-8 max-w-md mx-auto mt-8 text-center">
      <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="size-5" />
      </div>
      <h2 className="font-semibold">Lỗi tải trang admin</h2>
      <p className="text-sm text-muted-foreground mt-2 break-words">
        {error.message ?? 'Vui lòng thử lại.'}
      </p>
      <Button onClick={reset} variant="outline" className="mt-4">
        <RefreshCw className="size-4" />
        Thử lại
      </Button>
    </Card>
  );
}
