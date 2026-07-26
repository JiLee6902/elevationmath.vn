import Link from 'next/link';
import { BadgeCheck, BookMarked, Infinity as InfinityIcon } from 'lucide-react';
import { LogoWordmark } from '@/components/user/logo-mark';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel thương hiệu — desktop */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/75 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)',
            backgroundSize: '22px 22px',
            maskImage: 'linear-gradient(135deg, black, transparent 80%)',
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -top-1/4 -left-1/4 size-[32rem] rounded-full bg-white/10 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 bottom-10 select-none font-display text-[18rem] leading-none text-white/10"
        >
          ∑
        </span>

        <Link
          href="/"
          className="relative inline-flex w-fit rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <LogoWordmark size="lg" className="text-white" />
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Kho tài liệu toán cho mọi học sinh Việt Nam
          </h2>
          <p className="mt-4 leading-relaxed text-white/85">
            Lý thuyết, bài tập và đề thi từ lớp 1 đến lớp 12 — đọc trực tiếp,
            tải miễn phí, theo đúng mục tiêu học tập của bạn.
          </p>
          <ul className="mt-8 space-y-3">
            <Highlight icon={BadgeCheck} text="Tài liệu được kiểm duyệt" />
            <Highlight icon={BookMarked} text="Dễ tìm theo lớp và mục tiêu học tập" />
            <Highlight icon={InfinityIcon} text="Tải miễn phí, không giới hạn" />
          </ul>
          <div className="mt-10 flex gap-8 border-t border-white/15 pt-6">
            <Stat number="10K+" label="Tài liệu" />
            <Stat number="50K+" label="Lượt học / tháng" />
            <Stat number="100%" label="Miễn phí" />
          </div>
        </div>

        <p className="relative text-sm text-white/60">
          © {new Date().getFullYear()} Elevation Math
        </p>
      </div>

      {/* Form */}
      <div className="relative flex items-center justify-center overflow-hidden px-4 py-12">
        <span
          aria-hidden
          className="absolute inset-0 -z-10 lg:hidden"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--foreground) 5%, transparent) 1px, transparent 0)',
            backgroundSize: '22px 22px',
            maskImage:
              'radial-gradient(70% 60% at 50% 0%, black 20%, transparent 80%)',
          }}
        />
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-10 flex justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            <LogoWordmark size="lg" />
          </Link>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}

          <div className="mt-8">{children}</div>

          {footer && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {footer}
            </p>
          )}

          <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
            Bằng cách tiếp tục, bạn đồng ý với{' '}
            <span className="text-foreground/80">điều khoản</span> của chúng
            tôi.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold tracking-tight">{number}</div>
      <div className="mt-0.5 text-xs text-white/70">{label}</div>
    </div>
  );
}

function Highlight({
  icon: Icon,
  text,
}: {
  icon: typeof BadgeCheck;
  text: string;
}) {
  return (
    <li className="flex items-center gap-3 text-sm text-white/90">
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm"
      >
        <Icon className="size-4" />
      </span>
      {text}
    </li>
  );
}
