import 'dotenv/config';
import { config as dotenvConfig } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  chapters,
  difficultyLevels,
  documents,
  documentTypes,
  programGroups,
  users,
} from './schema';
import * as schema from './schema';
import { DEFAULT_PROGRAM_GROUPS } from '../constants';
import { hashPassword } from '../password';
import { slugify } from '../utils';
import { eq } from 'drizzle-orm';

dotenvConfig({ path: '.env.local' });

if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');

const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
const db = drizzle(client, { schema });
const SAMPLE_PDF = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

type Level = 'tieu_hoc' | 'thcs' | 'thpt';
type SampleDoc = {
  title: string;
  description: string;
  level: Level;
  grade: number;
  group: string;
  typeName: string;
  difficulty: 'co_ban' | 'nang_cao';
  downloads: number;
};

const CHAPTER_NAMES: Record<Level, string[]> = {
  tieu_hoc: ['Số và phép tính', 'Hình học và đo lường', 'Thống kê và xác suất'],
  thcs: ['Số và đại số', 'Hình học', 'Thống kê và xác suất', 'Chuyên đề ôn tập'],
  thpt: ['Đại số', 'Hình học', 'Giải tích', 'Xác suất và thống kê'],
};

const GRADE_LEVELS: Array<[Level, number[]]> = [['tieu_hoc', [1, 2]]];

const TYPE_NAMES = [
  'Phân phối CT Toán (Mới)',
  'Phiếu rèn kỹ năng Tuần',
  'Toán tư duy',
  'Giáo án',
  'Tài liệu',
  'Đề cương ôn tập',
  'Đề thi & kiểm tra',
] as const;

const DIFFICULTY_LEVELS = [
  { key: 'co_ban', name: 'Cơ bản', color: '#2563eb', order: 1 },
  { key: 'nang_cao', name: 'Nâng cao', color: '#f59e0b', order: 2 },
] as const;

const DISTRIBUTION_TYPE_NAME = 'Phân phối CT Toán (Mới)';

const GROUPS = DEFAULT_PROGRAM_GROUPS.map((group) => group.slug);

const SAMPLE_DOCS: SampleDoc[] = [1, 2].flatMap((grade) =>
  TYPE_NAMES.map((typeName, index) => ({
    title: `${typeName} Toán lớp ${grade}`,
    description: `${typeName} dành cho học sinh lớp ${grade}, có nội dung và hướng dẫn học tập phù hợp theo lớp.`,
    level: 'tieu_hoc' as const,
    grade,
    group: GROUPS[index % GROUPS.length],
    typeName,
    difficulty: index === 2 || index === 5 ? 'nang_cao' as const : 'co_ban' as const,
    downloads: 1500 - grade * 100 - index * 70,
  })),
);

async function main() {
  console.log('🌱 Seeding…');
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@elevationmath.vn';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
  const passwordHash = await hashPassword(adminPassword);
  const [existingAdmin] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
  const adminId = existingAdmin
    ? existingAdmin.id
    : (await db.insert(users).values({
        email: adminEmail,
        passwordHash,
        fullName: 'Elevation Math Admin',
        role: 'super_admin',
        isVerified: true,
      }).returning({ id: users.id }))[0].id;

  if (existingAdmin) {
    await db.update(users).set({ role: 'super_admin', isVerified: true }).where(eq(users.id, adminId));
  }
  console.log(`  → Admin: ${adminEmail}`);

  // Bộ dữ liệu demo được thay hoàn toàn để không còn loại tài liệu cũ.
  await db.delete(documents);
  await db.delete(documentTypes);

  for (const [level, grades] of GRADE_LEVELS) {
    for (const grade of grades) {
      for (const [index, name] of CHAPTER_NAMES[level].entries()) {
        await db.insert(chapters).values({
          level,
          grade,
          number: index + 1,
          name,
          slug: slugify(`${level}-${grade}-${name}`),
          order: index + 1,
        }).onConflictDoNothing();
      }
    }
  }
  console.log('  → Insert chương học cho lớp 1–2');

  for (const group of DEFAULT_PROGRAM_GROUPS) {
    await db.insert(programGroups).values(group).onConflictDoNothing({ target: programGroups.slug });
  }
  for (const difficulty of DIFFICULTY_LEVELS) {
    await db.insert(difficultyLevels).values({
      ...difficulty,
      isActive: true,
    }).onConflictDoUpdate({
      target: difficultyLevels.key,
      set: {
        name: difficulty.name,
        color: difficulty.color,
        order: difficulty.order,
        isActive: true,
        updatedAt: new Date(),
      },
    });
  }
  const groupRows = await db.select().from(programGroups);
  const groupIds = new Map(groupRows.map((group) => [group.slug, group.id]));
  console.log(`  → Insert ${DEFAULT_PROGRAM_GROUPS.length} nhóm chương trình`);

  function levelForGrade(grade: number): Level {
    if (grade <= 5) return 'tieu_hoc';
    if (grade <= 9) return 'thcs';
    return 'thpt';
  }

  for (const grade of [1, 2]) {
    for (const [index, name] of TYPE_NAMES.entries()) {
      await db.insert(documentTypes).values({
        name,
        slug: slugify(`tieu-hoc-lop-${grade}-${name}`),
        level: 'tieu_hoc',
        grade,
        order: index + 1,
        isActive: true,
      });
    }
  }
  for (const grade of [3, 4, 5, 6, 7, 8, 9]) {
    const level = levelForGrade(grade);
    await db.insert(documentTypes).values({
      name: DISTRIBUTION_TYPE_NAME,
      slug: slugify(`${level}-lop-${grade}-${DISTRIBUTION_TYPE_NAME}`),
      level,
      grade,
      order: 1,
      isActive: true,
    });
  }
  const typeRows = await db.select().from(documentTypes);
  const typeIds = new Map(
    typeRows.map((type) => [`${type.level}-${type.grade}-${type.name}`, type.id]),
  );
  console.log(`  → Insert ${TYPE_NAMES.length} loại tài liệu cho lớp 1–2, riêng ${DISTRIBUTION_TYPE_NAME} cho lớp 1–9`);

  const chapterRows = await db.select().from(chapters);
  for (const [index, doc] of SAMPLE_DOCS.entries()) {
    const chapter = chapterRows.find((row) => row.level === doc.level && row.grade === doc.grade);
    await db.insert(documents).values({
      title: doc.title,
      slug: slugify(doc.title),
      description: doc.description,
      level: doc.level,
      grade: doc.grade,
      programGroupId: groupIds.get(doc.group) ?? null,
      chapterId: chapter?.id ?? null,
      documentTypeId: typeIds.get(`${doc.level}-${doc.grade}-${doc.typeName}`) ?? null,
      difficulty: doc.difficulty,
      fileUrl: SAMPLE_PDF,
      fileSize: 1_024_000,
      fileType: 'application/pdf',
      pageCount: 8 + (index % 20),
      // Hiển thị preview trang đầu PDF thật trên card và hero, không dùng bìa giả.
      thumbnailUrl: `/covers/sample-${(index % 10) + 1}.png`,
      tags: ['toán', `lớp ${doc.grade}`, doc.group],
      downloadCount: doc.downloads,
      viewCount: doc.downloads * 3,
      rating: 45 + (index % 6),
      ratingCount: 12 + index * 3,
      isFeatured: index < 8,
      status: index >= 33 ? 'pending' : 'approved',
      uploaderId: adminId,
      approvedById: index >= 33 ? null : adminId,
      approvedAt: index >= 33 ? null : new Date(),
    }).onConflictDoNothing({ target: documents.slug });
  }
  console.log(`  → Insert ${SAMPLE_DOCS.length} tài liệu mẫu cho lớp 1–2`);
  console.log('✅ Seed xong');
  await client.end();
}

main().catch(async (error) => {
  console.error('❌ Seed lỗi', error);
  await client.end();
  process.exit(1);
});
