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

// Nhóm loại tài liệu (tầng cha cố định cho mọi lớp).
const documentCategories = [
  ['Tài liệu Dạy & Học', 'day-va-hoc', 1],
  ['Đề cương & Đề thi', 'de-cuong-de-thi', 2],
  ['Tài liệu Luyện thi', 'luyen-thi', 3],
  ['Tài liệu cho Giáo viên', 'giao-vien', 4],
];

// Suy ra nhóm cha từ tên loại tài liệu (best-effort theo từ khoá).
function categorySlugForType(name) {
  const n = name.toLowerCase();
  if (
    n.includes('giáo án') ||
    n.includes('bài giảng') ||
    n.includes('giáo viên') ||
    n.includes('sách giáo viên')
  )
    return 'giao-vien';
  if (
    n.includes('đề cương') ||
    n.includes('đề thi') ||
    n.includes('đề kiểm tra') ||
    n.includes('kiểm tra')
  )
    return 'de-cuong-de-thi';
  if (
    n.includes('luyện thi') ||
    n.includes('kangaroo') ||
    n.includes('olympic') ||
    n.includes('timo') ||
    n.includes('sasmo') ||
    n.includes('imc') ||
    n.includes('vtmo') ||
    n.includes('hsg') ||
    n.includes('vào 10') ||
    n.includes('vào lớp') ||
    n.includes('chuyên') ||
    n.includes('đánh giá năng lực') ||
    n.includes('sat') ||
    n.includes('thpt quốc gia')
  )
    return 'luyen-thi';
  return 'day-va-hoc';
}

const distributionTypeName = 'Phân phối CT Toán (Mới)';
const chapterNames = ['Số và phép tính', 'Hình học và đo lường', 'Thống kê và xác suất'];

// Danh mục loại tài liệu chi tiết theo từng lớp (nguồn: "Nội dung phân loại").
// Nhóm "Đề cương & Đề thi" và "Giáo viên" giống nhau ở mọi lớp.
const EXAM_TYPES = [
  'Đề cương ôn tập giữa học kỳ I',
  'Đề cương ôn tập học kỳ I',
  'Đề cương ôn tập giữa học kỳ II',
  'Đề cương ôn tập học kỳ II',
  'Đề kiểm tra giữa học kỳ I',
  'Đề kiểm tra học kỳ I',
  'Đề kiểm tra giữa học kỳ II',
  'Đề kiểm tra học kỳ II',
];
const TEACHER_TYPES = [
  'Giáo án',
  'Bài giảng điện tử',
  'Sách giáo viên',
  'Tài liệu khác',
];
const COMPETITION_PRIMARY = [
  'Toán Quốc tế Kangaroo (IKMC)',
  'Olympic Toán Quốc tế TIMO',
  'Kỳ thi Olympic Toán Singapore và Châu Á (SASMO)',
  'Kỳ thi Toán học Quốc tế IMC',
  'Olympic Toán Titan Việt Nam (VTMO)',
];

// Nhóm "Dạy & Học" theo lớp.
const TEACHING_BY_GRADE = {
  1: [
    'Sách giáo khoa Toán 1 (PDF)',
    'Phiếu rèn kỹ năng làm Toán tuần',
    'Sách toán hay lớp 1 (PDF)',
    'Toán tư duy lớp 1',
  ],
  2: [
    'Sách giáo khoa Toán 2 (PDF)',
    'Phiếu rèn kỹ năng làm Toán tuần',
    'Tài liệu Trọng tâm Toán 2 (Theo chuyên đề)',
    'Tài liệu nâng cao Toán 2 (Theo chuyên đề)',
    'Sách toán hay lớp 2 (PDF)',
    'Toán tư duy lớp 2',
  ],
  3: [
    'Sách giáo khoa Toán 3 (PDF)',
    'Phiếu rèn kỹ năng làm Toán tuần',
    'Tài liệu Trọng tâm Toán 3 (Theo chuyên đề)',
    'Tài liệu nâng cao Toán 3 (Theo chuyên đề)',
    'Sách toán hay lớp 3 (PDF)',
    'Toán tư duy lớp 3',
  ],
  4: [
    'Sách giáo khoa Toán 4 (PDF)',
    'Phiếu rèn kỹ năng làm Toán tuần Lớp 4',
    'Tài liệu Trọng tâm Toán 4 (Theo chuyên đề)',
    'Tài liệu nâng cao Toán 4 (Theo chuyên đề)',
    'Sách toán hay lớp 4 (PDF)',
    'Toán tư duy lớp 4',
    'Tài liệu luyện thi Chuyên – CLC',
  ],
  5: [
    'Sách giáo khoa Toán 5 (PDF)',
    'Phiếu rèn kỹ năng làm Toán tuần',
    'Tài liệu Trọng tâm Toán 5 (Theo chuyên đề)',
    'Tài liệu nâng cao Toán 5 (Theo chuyên đề)',
    'Sách toán hay lớp 5 (PDF)',
    'Tài liệu luyện thi Chuyên – CLC',
    'Ngân hàng đề thi vào lớp 6 CLC – Chuyên',
    'Đề thi vào lớp 6 các trường chuyên qua các năm',
  ],
  6: [
    'Sách giáo khoa Toán 6 (PDF)',
    'Phiếu rèn kỹ năng làm Toán tuần',
    'Tài liệu Trọng tâm Toán 6 (Theo chuyên đề)',
    'Tài liệu nâng cao Toán 6 (Theo chuyên đề)',
    'Sách toán hay lớp 6 (PDF)',
    'Tài liệu luyện thi HSG 6',
  ],
  7: [
    'Sách giáo khoa Toán 7 (PDF)',
    'Phiếu rèn kỹ năng làm Toán tuần',
    'Tài liệu Trọng tâm Toán 7 (Theo chuyên đề)',
    'Tài liệu nâng cao Toán 7 (Theo chuyên đề)',
    'Sách toán hay lớp 7 (PDF)',
    'Tài liệu luyện thi HSG 7',
  ],
  8: [
    'Sách giáo khoa Toán 8 (PDF)',
    'Phiếu rèn kỹ năng làm Toán tuần',
    'Tài liệu Trọng tâm Toán 8 (Theo chuyên đề)',
    'Tài liệu nâng cao Toán 8 (Theo chuyên đề)',
    'Sách toán hay lớp 8 (PDF)',
    'Tài liệu luyện thi HSG 8',
  ],
  9: [
    'Sách giáo khoa Toán 9 (PDF)',
    'Phiếu rèn kỹ năng làm Toán tuần',
    'Tài liệu Trọng tâm Toán 9 (Theo chuyên đề)',
    'Tài liệu nâng cao Toán 9 (Theo chuyên đề)',
    'Sách toán hay lớp 9 (PDF)',
    'Tài liệu luyện thi vào lớp 10',
    'Tài liệu luyện thi vào lớp 10 chuyên Toán',
    'Ngân hàng đề thi thử vào lớp 10',
    'Đề thi thử và đề thi chính thức vào lớp 10 các trường THPT cập nhật mới nhất',
    'Tài liệu luyện thi HSG',
    'Đề thi vào các trường THPT Chuyên',
  ],
  10: [
    'Sách giáo khoa Toán 10 (PDF)',
    'Tài liệu Toán theo chuyên đề lớp 10',
    'Tài liệu Bồi dưỡng nâng cao Toán 10',
    'Tài liệu chuyên Toán 10',
    'Sách toán hay lớp 10 (PDF)',
    'Tài liệu Toán Cambridge 10',
  ],
  11: [
    'Sách giáo khoa Toán 11 (PDF)',
    'Tài liệu Toán theo chuyên đề lớp 11',
    'Tài liệu Bồi dưỡng nâng cao Toán 11',
    'Tài liệu chuyên Toán 11',
    'Sách toán hay lớp 11 (PDF)',
    'Tài liệu Toán Cambridge 11',
    'Tài liệu Đánh giá năng lực 11',
  ],
  12: [
    'Sách giáo khoa Toán 12 (PDF)',
    'Tài liệu Toán theo chuyên đề lớp 12',
    'Tài liệu Bồi dưỡng nâng cao Toán 12',
    'Tài liệu luyện thi THPT Quốc Gia',
    'Tài liệu chuyên Toán 12',
    'Sách toán hay lớp 12 (PDF)',
    'Tài liệu Toán Cambridge 12',
    'Tài liệu đánh giá năng lực 12',
  ],
};

// Nhóm "Luyện thi" theo lớp (lớp nào không có thì để rỗng).
const COMPETITION_BY_GRADE = {
  1: [],
  2: COMPETITION_PRIMARY,
  3: COMPETITION_PRIMARY,
  4: COMPETITION_PRIMARY,
  5: COMPETITION_PRIMARY,
  6: COMPETITION_PRIMARY,
  7: COMPETITION_PRIMARY,
  8: [],
  9: [],
  10: [],
  11: ['Tài liệu luyện thi Đánh giá năng lực', 'Tài liệu luyện thi SAT'],
  12: ['Luyện thi Đánh giá năng lực', 'Luyện thi SAT'],
};

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

  for (const category of documentCategories) {
    await sql`
      insert into document_categories (name, slug, "order", is_active)
      values (${category[0]}, ${category[1]}, ${category[2]}, true)
      on conflict (slug) do update
        set name = excluded.name,
            "order" = excluded."order",
            is_active = true,
            updated_at = now()
    `;
  }

  const categoryRows = await sql`select id, slug from document_categories`;
  const categoryIdBySlug = Object.fromEntries(
    categoryRows.map((r) => [r.slug, r.id]),
  );

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
  }

  // Seed toàn bộ danh mục loại tài liệu cho 12 lớp, gom theo 4 nhóm.
  // Thứ tự chạy liên tục theo nhóm để giữ đúng thứ tự hiển thị.
  for (let grade = 1; grade <= 12; grade++) {
    const level = levelForGrade(grade);
    const sections = [
      ['day-va-hoc', TEACHING_BY_GRADE[grade] ?? []],
      ['de-cuong-de-thi', EXAM_TYPES],
      ['luyen-thi', COMPETITION_BY_GRADE[grade] ?? []],
      ['giao-vien', TEACHER_TYPES],
    ];
    let order = 1;
    for (const [catSlug, names] of sections) {
      for (const name of names) {
        await sql`
          insert into document_types (name, slug, category_id, level, grade, "order", is_active)
          values (${name}, ${slugify(`${level}-lop-${grade}-${name}`)}, ${categoryIdBySlug[catSlug]}, ${level}, ${grade}, ${order}, true)
          on conflict (slug) do update
            set name = excluded.name,
                category_id = excluded.category_id,
                "order" = excluded."order",
                is_active = true,
                updated_at = now()
        `;
        order++;
      }
    }
  }

  // Backfill: gán nhóm cho mọi loại tài liệu chưa có nhóm (kể cả loại do
  // admin tạo trước khi có tính năng này).
  const untypedRows = await sql`select id, name from document_types where category_id is null`;
  for (const row of untypedRows) {
    await sql`
      update document_types
      set category_id = ${categoryIdBySlug[categorySlugForType(row.name)]}, updated_at = now()
      where id = ${row.id}
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
