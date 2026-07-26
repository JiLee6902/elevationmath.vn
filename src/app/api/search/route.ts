import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { and, desc, eq, ilike, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }
  const term = `%${q}%`;
  const results = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.status, 'approved'),
        or(ilike(documents.title, term), ilike(documents.description, term))!,
      ),
    )
    // Gợi ý sắp theo lượt tải nhiều nhất
    .orderBy(desc(documents.downloadCount))
    .limit(8);
  return NextResponse.json({ results });
}
