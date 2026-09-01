import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ReceiptText,
  Send,
} from 'lucide-react';
import { LEVELS } from '@/lib/constants';
import { LogoWordmark } from './logo-mark';

const POPULAR_LINKS = [
  { label: 'Toán 9 — luyện thi vào 10', href: '/thcs/lop-9' },
  { label: 'Toán 12 — luyện thi THPT', href: '/thpt/lop-12' },
  { label: 'Toán 6', href: '/thcs/lop-6' },
  { label: 'Toán 5 — Tiểu học', href: '/tieu-hoc/lop-5' },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t bg-card/40 mt-auto">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--foreground) 6%, transparent) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          maskImage:
            'radial-gradient(80% 100% at 50% 0%, black 10%, transparent 70%)',
        }}
      />
      <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-12 gap-8 text-sm">
        <div className="col-span-2 md:col-span-4">
          <LogoWordmark size="md" />
          <p className="text-muted-foreground mt-4 max-w-xs leading-relaxed">
            Nền tảng học toán cho học sinh Việt Nam từ lớp 1 đến lớp 12.
          </p>
          <div className="flex items-center gap-1 mt-5">
            <SocialLink href="https://facebook.com" label="Facebook">
              <Globe className="size-4" />
            </SocialLink>
            <SocialLink href="https://zalo.me" label="Zalo">
              <MessageCircle className="size-4" />
            </SocialLink>
            <SocialLink href="https://t.me" label="Telegram">
              <Send className="size-4" />
            </SocialLink>
            <SocialLink href="mailto:hello@elevationmath.vn" label="Email">
              <Mail className="size-4" />
            </SocialLink>
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            Cấp học
          </p>
          <ul className="space-y-2.5 text-muted-foreground">
            {Object.entries(LEVELS).map(([key, l]) => (
              <li key={key}>
                <FooterLink href={`/${l.slug}`}>{l.name}</FooterLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            Phổ biến
          </p>
          <ul className="space-y-2.5 text-muted-foreground">
            {POPULAR_LINKS.map((l) => (
              <li key={l.href}>
                <FooterLink href={l.href}>{l.label}</FooterLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 md:col-span-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            Hệ thống Dạy học &amp; Luyện thi
          </p>
          <div className="rounded-2xl border border-border/60 bg-background/50 p-4 shadow-sm">
            <p className="text-sm font-semibold leading-snug text-foreground">
              Công ty TNHH Đào tạo &amp; Phát triển Giáo dục EMATH
            </p>
            <ul className="mt-3 space-y-2.5 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <ReceiptText className="mt-0.5 size-4 shrink-0 text-primary/70" />
                <span>
                  Mã số thuế{' '}
                  <span className="font-medium text-foreground/90">
                    0318915841
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary/70" />
                <span>Số 35/31c Bế Văn Cấm, Tân Hưng, TP. Hồ Chí Minh</span>
              </li>
            </ul>
            <div className="mt-3.5 flex flex-wrap gap-2">
              <a
                href="tel:0971321032"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/15"
              >
                <Phone className="size-3.5" /> 0971 321 032
              </a>
              <a
                href="tel:0988383732"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/15"
              >
                <Phone className="size-3.5" /> 0988 383 732
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} Elevation Math · Hệ thống dạy học &amp;
            luyện thi Toán
          </span>
          <span className="text-muted-foreground/80">
            Công ty TNHH Đào tạo &amp; Phát triển Giáo dục EMATH · MST 0318915841
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group/fl inline-flex items-center gap-1 transition-colors hover:text-foreground"
    >
      {children}
      <ArrowRight className="size-3 text-muted-foreground/0 transition-all group-hover/fl:translate-x-0.5 group-hover/fl:text-primary" />
    </Link>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith('http');
  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      aria-label={label}
      className="size-9 inline-flex items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
    >
      {children}
    </a>
  );
}
