'use client';

import * as React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function DownloadButton({ documentId }: { documentId: string }) {
  const [loading, setLoading] = React.useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/download`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Tải về thất bại');
      }
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank');
        toast.success('Đã bắt đầu tải về');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      className="w-full"
      size="lg"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      Tải về
    </Button>
  );
}
