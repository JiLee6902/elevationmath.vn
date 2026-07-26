import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@/lib/password';
import {
  createSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '@/lib/session';
import { loginSchema } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Email hoặc mật khẩu không hợp lệ' },
      { status: 400 },
    );
  }
  const { email, password } = parsed.data;

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Luôn so sánh để tránh timing attack revealing email tồn tại hay không
  const dummy = '$2a$12$0123456789012345678901uW1bC6h8b8h6.J7vKvJ8uGu5dQpVZQpa';
  const ok = await verifyPassword(password, user?.passwordHash ?? dummy);

  if (!user || !ok) {
    return NextResponse.json(
      { error: 'Email hoặc mật khẩu không đúng' },
      { status: 401 },
    );
  }

  const { token } = await createSession(user.id);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);

  return NextResponse.json({ ok: true });
}
