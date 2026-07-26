import { Suspense } from 'react';
import { HeaderSlot } from '@/components/user/header-slot';
import { Header } from '@/components/user/header';
import { Footer } from '@/components/user/footer';
import { ScrollToTop } from '@/components/user/scroll-to-top';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header shell render ngay (user=null), thực sự sẽ stream từ HeaderSlot */}
      <Suspense fallback={<Header user={null} programGroups={[]} />}>
        <HeaderSlot />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
