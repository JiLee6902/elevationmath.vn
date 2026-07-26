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
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Suspense fallback={<AdminTopbarSkeleton />}>
          <AdminTopbarSlot />
        </Suspense>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
