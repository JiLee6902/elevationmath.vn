'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Download,
  ExternalLink,
  Loader2,
  LogIn,
  Lock,
  Printer,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type Props = {
  documentId: string;
  fileUrl: string;
  /** Người dùng đã đăng nhập? Nếu chưa → chặn tải/in/mở bằng popup đăng ký. */
  isAuthed: boolean;
  /** 'bar' = toolbar ngang; 'compact' = chỉ nút tải (cho mobile bar). */
  variant?: 'bar' | 'compact';
  className?: string;
};

/** Cụm hành động: Tải về (chính) + Chia sẻ + Mở/In. Tải/In/Mở cần đăng nhập. */
export function DocToolbar({
  documentId,
  fileUrl,
  isAuthed,
  variant = 'bar',
  className,
}: Props) {
  const [loading, setLoading] = React.useState(false);
  const [gateOpen, setGateOpen] = React.useState(false);

  async function handleDownload() {
    if (!isAuthed) {
      setGateOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/download`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Tải về thất bại');
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

  // Mở/In file gốc — cũng cần đăng nhập.
  function openFile() {
    if (!isAuthed) {
      setGateOpen(true);
      return;
    }
    window.open(fileUrl, '_blank');
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url, title: document.title });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Đã sao chép liên kết');
      }
    } catch {
      /* user huỷ — bỏ qua */
    }
  }

  return (
    <>
      <div className={cn('flex items-center gap-2', className)}>
        <Button onClick={handleDownload} disabled={loading} className="gap-1.5">
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isAuthed ? (
            <Download className="size-4" />
          ) : (
            <Lock className="size-4" />
          )}
          Tải về
        </Button>

        {variant === 'bar' && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              aria-label="Chia sẻ"
              title="Chia sẻ"
            >
              <Share2 className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={openFile}
              aria-label="In"
              title="In"
            >
              <Printer className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={openFile}
              aria-label="Mở file gốc"
              title="Mở file gốc"
            >
              <ExternalLink className="size-4" />
            </Button>
          </>
        )}
      </div>

      {/* Popup chặn — yêu cầu đăng ký/đăng nhập */}
      <Dialog open={gateOpen} onOpenChange={setGateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="size-6" />
            </div>
            <DialogTitle className="text-center text-xl tracking-tight">
              Đăng ký để tải tài liệu
            </DialogTitle>
            <DialogDescription className="text-center">
              Tạo tài khoản miễn phí để tải và mở toàn bộ tài liệu trên
              Elevation Math. Chỉ mất 30 giây.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex flex-col gap-2">
            <Link href="/dang-ky" className="w-full">
              <Button size="lg" className="w-full gap-1.5">
                Đăng ký miễn phí
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/dang-nhap" className="w-full">
              <Button size="lg" variant="outline" className="w-full gap-1.5">
                <LogIn className="size-4" />
                Đã có tài khoản? Đăng nhập
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
