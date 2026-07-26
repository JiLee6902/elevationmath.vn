import { redirect } from 'next/navigation';
import { AdminTopbar } from './admin-topbar';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function AdminTopbarSlot() {
  const user = await getCurrentUser();
  if (!user) redirect('/dang-nhap?next=/admin');
  if (!isAdmin(user)) redirect('/');
  return <AdminTopbar user={user} />;
}
