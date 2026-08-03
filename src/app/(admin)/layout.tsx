import { Suspense } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbarSlot } from '@/components/admin/admin-topbar-slot';
import { AdminTopbarSkeleton } from '@/components/admin/admin-topbar-skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_34rem),linear-gradient(180deg,var(--background),color-mix(in_oklch,var(--muted)_55%,var(--background)))]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={<AdminTopbarSkeleton />}>
          <AdminTopbarSlot />
        </Suspense>
        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
