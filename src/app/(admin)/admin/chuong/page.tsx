import { db } from '@/lib/db';
import { chapters } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { ChaptersClient } from './chapters-client';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const list = await db
    .select()
    .from(chapters)
    .orderBy(asc(chapters.level), asc(chapters.grade), asc(chapters.number))
    .catch(() => []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold">Chương</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý chương theo lớp và chương trình
        </p>
      </div>
      <ChaptersClient chapters={list} />
    </div>
  );
}
