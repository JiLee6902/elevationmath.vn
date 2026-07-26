import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { userUpdateSchema } from '@/lib/validations/user';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }

  // Chỉ super_admin mới được nâng thành super_admin
  if (parsed.data.role === 'super_admin' && admin.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Chỉ super admin mới có thể đặt role này' },
      { status: 403 },
    );
  }

  const [updated] = await db
    .update(users)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return NextResponse.json(updated);
}
