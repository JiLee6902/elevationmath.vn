import Link from 'next/link';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      {/* Ký hiệu lớn mờ làm nền */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[22rem] leading-none text-primary/[0.06] md:text-[30rem]"
      >
        ?
      </span>
      <div className="container mx-auto max-w-md px-4 py-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Lỗi 404
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Không tìm thấy trang
        </h1>
        <p className="mt-3 text-muted-foreground">
          Đường dẫn này không tồn tại hoặc đã được di chuyển. Thử tìm tài liệu
          bạn cần nhé.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Link href="/">
            <Button>
              <Home className="size-4" />
              Về trang chủ
            </Button>
          </Link>
          <Link href="/tim-kiem">
            <Button variant="outline">
              <Search className="size-4" />
              Tìm tài liệu
            </Button>
          </Link>
        </div>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Quay lại
        </Link>
      </div>
    </div>
  );
}
