import { Header } from './header';
import { getCurrentUser } from '@/lib/auth';
import { getProgramGroups } from '@/lib/db/queries';

// Async server component — chạy trong Suspense boundary,
// stream vào layout shell sau khi resolve.
export async function HeaderSlot() {
  const [user, programGroups] = await Promise.all([
    getCurrentUser(),
    getProgramGroups().catch(() => []),
  ]);
  return <Header user={user} programGroups={programGroups} />;
}
