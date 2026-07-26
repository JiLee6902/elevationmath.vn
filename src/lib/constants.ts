export const LEVELS = {
  tieu_hoc: { name: 'Tiểu học', slug: 'tieu-hoc', grades: [1, 2, 3, 4, 5] },
  thcs: { name: 'THCS', slug: 'thcs', grades: [6, 7, 8, 9] },
  thpt: { name: 'THPT', slug: 'thpt', grades: [10, 11, 12] },
} as const;

/**
 * Nhóm chương trình học mặc định — dùng để SEED bảng `program_groups` lần đầu.
 * Sau đó admin quản lý động trong DB (thêm/sửa/xoá), KHÔNG đọc hằng số này nữa.
 * `color` là mã hex để render gradient bằng inline style.
 */
export const DEFAULT_PROGRAM_GROUPS = [
  {
    name: 'Tài liệu trọng tâm & lấy gốc',
    slug: 'lay-goc',
    description: 'Củng cố nền tảng, lấy lại căn bản từ đầu.',
    color: '#0ea5e9',
    order: 1,
  },
  {
    name: 'Tài liệu trọng tâm & phát triển',
    slug: 'phat-trien',
    description: 'Nắm vững trọng tâm và phát triển kỹ năng.',
    color: '#10b981',
    order: 2,
  },
  {
    name: 'Tài liệu bồi dưỡng & nâng cao',
    slug: 'nang-cao',
    description: 'Chuyên đề nâng cao cho học sinh khá, giỏi.',
    color: '#8b5cf6',
    order: 3,
  },
  {
    name: 'Tài liệu luyện thi',
    slug: 'luyen-thi',
    description: 'Ôn luyện thi vào 10, tốt nghiệp THPT, đánh giá năng lực.',
    color: '#f59e0b',
    order: 4,
  },
  {
    name: 'Đề cương ôn tập học kỳ',
    slug: 'de-cuong-on-tap-hoc-ky',
    description: 'Tổng hợp trọng tâm kiến thức trước mỗi kỳ kiểm tra.',
    color: '#e11d48',
    order: 5,
  },
  {
    name: 'Đề kiểm tra học kỳ',
    slug: 'de-kiem-tra-hoc-ky',
    description: 'Bộ đề kiểm tra học kỳ có đáp án và hướng dẫn.',
    color: '#2563eb',
    order: 6,
  },
  {
    name: 'Tài liệu ôn tập hè',
    slug: 'tai-lieu-on-tap-he',
    description: 'Duy trì nền tảng và chuẩn bị tốt cho năm học mới.',
    color: '#0891b2',
    order: 7,
  },
] as const;

export const DIFFICULTIES = {
  co_ban: { name: 'Cơ bản', color: 'bg-blue-100 text-blue-700' },
  nang_cao: { name: 'Nâng cao', color: 'bg-amber-100 text-amber-700' },
} as const;

export const USER_ROLES = {
  student: { name: 'Học sinh', color: 'bg-slate-100 text-slate-700' },
  teacher: { name: 'Giáo viên', color: 'bg-blue-100 text-blue-700' },
  admin: { name: 'Admin', color: 'bg-purple-100 text-purple-700' },
  super_admin: { name: 'Super Admin', color: 'bg-red-100 text-red-700' },
} as const;

export const DOC_STATUS = {
  pending: { name: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700' },
  approved: { name: 'Đã duyệt', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { name: 'Từ chối', color: 'bg-red-100 text-red-700' },
  archived: { name: 'Lưu trữ', color: 'bg-slate-100 text-slate-700' },
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    '.docx',
  ],
  'application/msword': ['.doc'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic'],
} as const;

export type LevelKey = keyof typeof LEVELS;
export type DifficultyKey = keyof typeof DIFFICULTIES;
export type UserRoleKey = keyof typeof USER_ROLES;
export type DocStatusKey = keyof typeof DOC_STATUS;

export function getLevelBySlug(slug: string): LevelKey | null {
  const entry = Object.entries(LEVELS).find(([, v]) => v.slug === slug);
  return entry ? (entry[0] as LevelKey) : null;
}
