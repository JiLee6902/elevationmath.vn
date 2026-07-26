import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/password';
import {
  createSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '@/lib/session';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' },
      { status: 400 },
    );
  }
  const { email, password, fullName } = parsed.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    return NextResponse.json({ error: 'Email đã được dùng' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const [inserted] = await db
    .insert(users)
    .values({ email, passwordHash, fullName })
    .returning({ id: users.id });

  const { token } = await createSession(inserted.id);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);

  return NextResponse.json({ ok: true });
}
