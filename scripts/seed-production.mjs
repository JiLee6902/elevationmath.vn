import bcrypt from 'bcryptjs';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('Missing DATABASE_URL');

const SAMPLE_PDF = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@elevationmath.vn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

const programGroups = [
  ['Tài liệu trọng tâm & lấy gốc', 'lay-goc', 'Củng cố nền tảng, lấy lại căn bản từ đầu.', '#0ea5e9', 1],
  ['Tài liệu trọng tâm & phát triển', 'phat-trien', 'Nắm vững trọng tâm và phát triển kỹ năng.', '#10b981', 2],
  ['Tài liệu bồi dưỡng & nâng cao', 'nang-cao', 'Chuyên đề nâng cao cho học sinh khá, giỏi.', '#8b5cf6', 3],
  ['Tài liệu luyện thi', 'luyen-thi', 'Ôn luyện thi vào 10, tốt nghiệp THPT, đánh giá năng lực.', '#f59e0b', 4],
  ['Đề cương ôn tập học kỳ', 'de-cuong-on-tap-hoc-ky', 'Tổng hợp trọng tâm kiến thức trước mỗi kỳ kiểm tra.', '#e11d48', 5],
  ['Đề kiểm tra học kỳ', 'de-kiem-tra-hoc-ky', 'Bộ đề kiểm tra học kỳ có đáp án và hướng dẫn.', '#2563eb', 6],
  ['Tài liệu ôn tập hè', 'tai-lieu-on-tap-he', 'Duy trì nền tảng và chuẩn bị tốt cho năm học mới.', '#0891b2', 7],
];

const documentTypes = [
  'Phân phối CT Toán (Mới)',
  'Phiếu rèn kỹ năng Tuần',
  'Toán tư duy',
  'Giáo án',
  'Tài liệu',
  'Đề cương ôn tập',
  'Đề thi & kiểm tra',
];

const difficultyLevels = [
  ['co_ban', 'Cơ bản', '#2563eb', 1],
  ['nang_cao', 'Nâng cao', '#f59e0b', 2],
];

const distributionTypeName = 'Phân phối CT Toán (Mới)';
const chapterNames = ['Số và phép tính', 'Hình học và đo lường', 'Thống kê và xác suất'];

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function levelForGrade(grade) {
  if (grade <= 5) return 'tieu_hoc';
  if (grade <= 9) return 'thcs';
  return 'thpt';
}

const sql = postgres(DATABASE_URL, {
  max: 1,
  prepare: false,
  ssl: process.env.DATABASE_SSL === 'disable' ? false : 'require',
});

try {
  console.log('Seeding production defaults...');

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const [admin] = await sql`
    insert into users (email, password_hash, full_name, role, is_verified)
    values (${ADMIN_EMAIL}, ${passwordHash}, 'Elevation Math Admin', 'super_admin', true)
    on conflict (email) do update
      set password_hash = ${passwordHash}, role = 'super_admin', is_verified = true, updated_at = now()
    returning id
  `;

  for (const group of programGroups) {
    await sql`
      insert into program_groups (name, slug, description, color, "order", is_active)
      values (${group[0]}, ${group[1]}, ${group[2]}, ${group[3]}, ${group[4]}, true)
      on conflict (slug) do update
        set name = excluded.name,
            description = excluded.description,
            color = excluded.color,
            "order" = excluded."order",
            is_active = true,
            updated_at = now()
    `;
  }

  for (const difficulty of difficultyLevels) {
    await sql`
      insert into difficulty_levels ("key", name, color, "order", is_active)
      values (${difficulty[0]}, ${difficulty[1]}, ${difficulty[2]}, ${difficulty[3]}, true)
      on conflict ("key") do update
        set name = excluded.name,
            color = excluded.color,
            "order" = excluded."order",
            is_active = true,
            updated_at = now()
    `;
  }

  for (const grade of [1, 2]) {
    for (const [index, name] of chapterNames.entries()) {
      await sql`
        insert into chapters (level, grade, number, name, slug, "order")
        select 'tieu_hoc', ${grade}, ${index + 1}, ${name}, ${slugify(`tieu-hoc-${grade}-${name}`)}, ${index + 1}
        where not exists (
          select 1 from chapters
          where level = 'tieu_hoc' and grade = ${grade} and slug = ${slugify(`tieu-hoc-${grade}-${name}`)}
        )
      `;
    }

    for (const [index, name] of documentTypes.entries()) {
      await sql`
        insert into document_types (name, slug, level, grade, "order", is_active)
        values (${name}, ${slugify(`tieu-hoc-lop-${grade}-${name}`)}, 'tieu_hoc', ${grade}, ${index + 1}, true)
        on conflict (slug) do update
          set name = excluded.name,
              "order" = excluded."order",
              is_active = true,
              updated_at = now()
      `;
    }
  }

  for (const grade of [3, 4, 5, 6, 7, 8, 9]) {
    const level = levelForGrade(grade);
    await sql`
      insert into document_types (name, slug, level, grade, "order", is_active)
      values (${distributionTypeName}, ${slugify(`${level}-lop-${grade}-${distributionTypeName}`)}, ${level}, ${grade}, 1, true)
      on conflict (slug) do update
        set name = excluded.name,
            level = excluded.level,
            grade = excluded.grade,
            "order" = excluded."order",
            is_active = true,
            updated_at = now()
    `;
  }

  const [{ count }] = await sql`select count(*)::int as count from documents`;
  if (count === 0) {
    const groups = await sql`select id, slug from program_groups order by "order"`;
    const types = await sql`select id, name, grade from document_types order by grade, "order"`;
    const chapters = await sql`select id, grade from chapters where level = 'tieu_hoc' order by grade, "order"`;

    for (const grade of [1, 2]) {
      const chapter = chapters.find((row) => row.grade === grade);
      const gradeTypes = types.filter((row) => row.grade === grade);

      for (const [index, type] of gradeTypes.entries()) {
        const group = groups[index % groups.length];
        const title = `${type.name} Toán lớp ${grade}`;
        const difficulty = index === 2 || index === 5 ? 'nang_cao' : 'co_ban';
        await sql`
          insert into documents (
            title, slug, description, level, grade, program_group_id, chapter_id,
            document_type_id, difficulty, file_url, file_size, file_type, page_count,
            thumbnail_url, tags, download_count, view_count, rating, rating_count,
            is_featured, status, uploader_id, approved_by_id, approved_at
          )
          values (
            ${title}, ${slugify(title)},
            ${`${type.name} dành cho học sinh lớp ${grade}, có nội dung và hướng dẫn học tập phù hợp theo lớp.`},
            'tieu_hoc', ${grade}, ${group.id}, ${chapter?.id ?? null},
            ${type.id}, ${difficulty}, ${SAMPLE_PDF}, 1024000, 'application/pdf', ${8 + index},
            ${`/covers/sample-${(index % 10) + 1}.png`}, ${sql.json(['toán', `lớp ${grade}`, group.slug])},
            ${1500 - grade * 100 - index * 70}, ${4500 - grade * 300 - index * 210},
            ${45 + (index % 6)}, ${12 + index * 3}, ${index < 4}, 'approved',
            ${admin.id}, ${admin.id}, now()
          )
          on conflict (slug) do nothing
        `;
      }
    }
  }

  console.log(`Production seed complete. Admin: ${ADMIN_EMAIL}`);
} finally {
  await sql.end();
}
