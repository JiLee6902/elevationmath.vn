import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { SESSION_COOKIE, getSessionUserId } from '@/lib/session';
import type { User } from '@/lib/db/schema';

// React.cache: dedupe trong cùng 1 request render — layout + page + component
// gọi nhiều lần nhưng chỉ truy vấn DB một lần.
export const getCurrentUser = cache(_getCurrentUser);

async function _getCurrentUser(): Promise<User | null> {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const userId = await getSessionUserId(token);
    if (!userId) return null;

    const [profile] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return profile ?? null;
  } catch (e) {
    console.error('[getCurrentUser]', e);
    return null;
  }
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect('/dang-nhap');
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect('/dang-nhap');
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    redirect('/');
  }
  return user;
}

export function isAdmin(user: User | null): boolean {
  return !!user && (user.role === 'admin' || user.role === 'super_admin');
}
