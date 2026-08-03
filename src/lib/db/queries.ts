import { and, asc, desc, eq, ilike, inArray, or, sql, count } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { db } from './index';
import {
  documents,
  chapters,
  documentTypes,
  difficultyLevels,
  programGroups,
  users,
  downloads,
  type Document,
  type Chapter,
  type DocumentType,
} from './schema';
import type { DocumentFilter, PaginatedResponse } from '@/types';

/** Tất cả nhóm chương trình đang bật, sắp theo `order`. */
export async function getProgramGroups(includeHidden = false) {
  return db
    .select()
    .from(programGroups)
    .where(includeHidden ? undefined : eq(programGroups.isActive, true))
    .orderBy(asc(programGroups.order), asc(programGroups.name));
}

/** Đếm tài liệu (approved) theo từng lớp trong một nhóm chương trình. */
export async function getGradeCountsForProgramGroup(programGroupId: string) {
  const rows = await db
    .select({ grade: documents.grade, total: count() })
    .from(documents)
    .where(
      and(
        eq(documents.programGroupId, programGroupId),
        eq(documents.status, 'approved'),
      ),
    )
    .groupBy(documents.grade);
  return rows
    .map((r) => ({ grade: r.grade, count: Number(r.total) }))
    .sort((a, b) => a.grade - b.grade);
}

/** Lấy 1 nhóm theo slug (chỉ nhóm đang bật). */
export async function getProgramGroupBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(programGroups)
    .where(and(eq(programGroups.slug, slug), eq(programGroups.isActive, true)))
    .limit(1);
  return row ?? null;
}

type DocStatusValue =
  (typeof documents.status.enumValues)[number];
type LevelValue = (typeof documents.level.enumValues)[number];
type DifficultyValue = (typeof documents.difficulty.enumValues)[number];

export type DocumentWithRelations = Document & {
  chapter: Chapter | null;
  documentType: DocumentType | null;
};

export async function getDocumentTypes(
  filter: { level?: string; grade?: number; includeHidden?: boolean } = {},
) {
  const conditions = [];
  if (filter.level)
    conditions.push(eq(documentTypes.level, filter.level as LevelValue));
  if (filter.grade) conditions.push(eq(documentTypes.grade, filter.grade));
  if (!filter.includeHidden) conditions.push(eq(documentTypes.isActive, true));
  return db
    .select()
    .from(documentTypes)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(documentTypes.order), asc(documentTypes.name));
}

export async function getDifficultyLevels(includeHidden = false) {
  return db
    .select()
    .from(difficultyLevels)
    .where(includeHidden ? undefined : eq(difficultyLevels.isActive, true))
    .orderBy(asc(difficultyLevels.order), asc(difficultyLevels.name));
}

export async function getDocuments(
  filter: DocumentFilter & { page?: number; limit?: number },
): Promise<PaginatedResponse<DocumentWithRelations>> {
  const page = Math.max(1, filter.page ?? 1);
  const limit = Math.min(100, Math.max(1, filter.limit ?? 20));
  const offset = (page - 1) * limit;

  const conditions = [];
  if (filter.level)
    conditions.push(eq(documents.level, filter.level as LevelValue));
  if (filter.grades?.length)
    conditions.push(inArray(documents.grade, filter.grades));
  else if (filter.grade) conditions.push(eq(documents.grade, filter.grade));
  if (filter.programGroupId)
    conditions.push(eq(documents.programGroupId, filter.programGroupId));
  if (filter.chapterIds?.length)
    conditions.push(inArray(documents.chapterId, filter.chapterIds));
  if (filter.documentTypeIds?.length)
    conditions.push(
      inArray(documents.documentTypeId, filter.documentTypeIds),
    );
  if (filter.difficulties?.length)
    conditions.push(
      inArray(documents.difficulty, filter.difficulties as DifficultyValue[]),
    );
  if (filter.status)
    conditions.push(eq(documents.status, filter.status as DocStatusValue));
  else conditions.push(eq(documents.status, 'approved'));
  if (filter.uploaderId)
    conditions.push(eq(documents.uploaderId, filter.uploaderId));
  if (filter.search) {
    const term = `%${filter.search}%`;
    conditions.push(
      or(ilike(documents.title, term), ilike(documents.description, term))!,
    );
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const orderBy =
    filter.sort === 'popular'
      ? [desc(documents.downloadCount), desc(documents.createdAt)]
      : filter.sort === 'top_rated'
      ? [desc(documents.rating), desc(documents.ratingCount)]
      : [desc(documents.createdAt)];

  const [countResult, rows] = await Promise.all([
    db.select({ total: count() }).from(documents).where(whereClause),
    db.query.documents.findMany({
      where: whereClause,
      with: { chapter: true, documentType: true },
      orderBy,
      limit,
      offset,
    }),
  ]);
  const total = countResult[0]?.total ?? 0;

  return {
    data: rows,
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  };
}

export async function getDocumentBySlug(slug: string) {
  return db.query.documents.findFirst({
    where: eq(documents.slug, slug),
    with: { chapter: true, documentType: true, uploader: true },
  });
}

export async function getDocumentById(id: string) {
  return db.query.documents.findFirst({
    where: eq(documents.id, id),
    with: { chapter: true, documentType: true, uploader: true },
  });
}

export const getChapters = unstable_cache(
  async (filter: {
    level?: string;
    grade?: number;
  }) => {
    const conditions = [];
    if (filter.level)
      conditions.push(eq(chapters.level, filter.level as LevelValue));
    if (filter.grade) conditions.push(eq(chapters.grade, filter.grade));

    return db
      .select()
      .from(chapters)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(chapters.order, chapters.number);
  },
  ['chapters-by-filter'],
  { revalidate: 3600, tags: ['chapters'] },
);

export async function getRelatedDocuments(doc: Document, limit = 6) {
  return db.query.documents.findMany({
    where: and(
      eq(documents.level, doc.level),
      eq(documents.grade, doc.grade),
      eq(documents.status, 'approved'),
      sql`${documents.id} != ${doc.id}`,
    ),
    orderBy: [desc(documents.downloadCount)],
    limit,
    with: { chapter: true, documentType: true },
  });
}

export async function getStats() {
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  // Chạy tất cả query song song để giảm latency
  const [
    [docTotal],
    [pendingTotal],
    [userTotal],
    [downloadTotal],
    dailyDownloads,
  ] = await Promise.all([
    db.select({ value: count() }).from(documents),
    db
      .select({ value: count() })
      .from(documents)
      .where(eq(documents.status, 'pending')),
    db.select({ value: count() }).from(users),
    db
      .select({ value: count() })
      .from(downloads)
      .where(sql`${downloads.createdAt} >= ${monthAgo.toISOString()}`),
    db
      .select({
        date: sql<string>`to_char(${downloads.createdAt}, 'YYYY-MM-DD')`,
        count: count(),
      })
      .from(downloads)
      .where(sql`${downloads.createdAt} >= ${monthAgo.toISOString()}`)
      .groupBy(sql`to_char(${downloads.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${downloads.createdAt}, 'YYYY-MM-DD')`),
  ]);

  return {
    totalDocuments: Number(docTotal.value),
    pendingDocuments: Number(pendingTotal.value),
    totalUsers: Number(userTotal.value),
    monthDownloads: Number(downloadTotal.value),
    downloadsByDay: dailyDownloads.map((r) => ({
      date: r.date,
      count: Number(r.count),
    })),
  };
}

export async function getRecentDocuments(limit = 10) {
  return db.query.documents.findMany({
    where: eq(documents.status, 'approved'),
    orderBy: [desc(documents.createdAt)],
    limit,
    with: { uploader: true, chapter: true, documentType: true },
  });
}

export async function getTopDocuments(limit = 10) {
  return db.query.documents.findMany({
    where: eq(documents.status, 'approved'),
    orderBy: [desc(documents.downloadCount)],
    limit,
    with: { chapter: true, documentType: true },
  });
}

/**
 * Tài liệu nổi bật do admin chọn (is_featured). Nếu admin chưa chọn cái nào
 * → fallback về tài liệu tải nhiều nhất, để trang chủ không bao giờ trống.
 */
export async function getFeaturedDocuments(limit = 12) {
  const featured = await db.query.documents.findMany({
    where: and(
      eq(documents.isFeatured, true),
      eq(documents.status, 'approved'),
    ),
    orderBy: [desc(documents.updatedAt)],
    limit,
    with: { chapter: true, documentType: true },
  });
  if (featured.length > 0) return featured;
  return getTopDocuments(limit);
}

export async function getDocCountsByGrade(level: LevelValue) {
  const rows = await db
    .select({
      grade: documents.grade,
      total: count(),
    })
    .from(documents)
    .where(
      and(eq(documents.level, level), eq(documents.status, 'approved')),
    )
    .groupBy(documents.grade);
  const map: Record<number, number> = {};
  for (const r of rows) map[r.grade] = Number(r.total);
  return map;
}
