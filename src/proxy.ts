import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { SESSION_COOKIE, getSessionUserId } from '@/lib/session';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  // /upload/* — chỉ cần đăng nhập
  if (path.startsWith('/upload')) {
    if (!token || !(await getSessionUserId(token))) {
      const url = request.nextUrl.clone();
      url.pathname = '/dang-nhap';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // /admin/* — cần đăng nhập + role admin/super_admin
  if (path.startsWith('/admin')) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/dang-nhap';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }
    const userId = await getSessionUserId(token);
    if (!userId) {
      const url = request.nextUrl.clone();
      url.pathname = '/dang-nhap';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }
    const [profile] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (
      !profile ||
      (profile.role !== 'admin' && profile.role !== 'super_admin')
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/upload/:path*'],
};
