import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Instrument_Serif, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { NavigationProgress } from '@/components/shared/navigation-progress';
import { cn } from '@/lib/utils';

const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  preload: true,
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  variable: '--font-display',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Elevation Math — Phát triển năng lực Toán',
  description:
    'Nền tảng tài liệu toán học cho học sinh Việt Nam từ lớp 1 đến lớp 12.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={cn(
        'h-full',
        beVietnamPro.variable,
        instrumentSerif.variable,
        geistMono.variable,
        'font-sans antialiased',
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
