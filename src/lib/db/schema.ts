import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const educationLevelEnum = pgEnum('education_level', [
  'tieu_hoc',
  'thcs',
  'thpt',
]);
export const docStatusEnum = pgEnum('doc_status', [
  'pending',
  'approved',
  'rejected',
  'archived',
]);
export const difficultyEnum = pgEnum('difficulty', [
  'co_ban',
  'nang_cao',
]);
export const userRoleEnum = pgEnum('user_role', [
  'student',
  'teacher',
  'admin',
  'super_admin',
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  role: userRoleEnum('role').default('student').notNull(),
  points: integer('points').default(0).notNull(),
  uploadCount: integer('upload_count').default(0).notNull(),
  downloadCount: integer('download_count').default(0).notNull(),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable(
  'sessions',
  {
    // Token opaque, random 32 bytes hex — KHÔNG dùng UUID để khó đoán hơn
    id: text('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('session_user_idx').on(t.userId)],
);

export const chapters = pgTable(
  'chapters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    level: educationLevelEnum('level').notNull(),
    grade: integer('grade').notNull(),
    number: integer('number').notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    order: integer('order').default(0),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [index('chapter_grade_idx').on(t.level, t.grade)],
);

// Nhóm chương trình học — trục phân loại theo mục tiêu (lấy gốc/phát triển/
// nâng cao/luyện thi). Quản lý động qua admin (không hard-code).
export const programGroups = pgTable(
  'program_groups',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    // Màu hex (vd "#0ea5e9") — render gradient bằng inline style để tránh
    // vấn đề Tailwind JIT không quét được class động từ DB.
    color: text('color').default('#0ea5e9').notNull(),
    order: integer('order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('program_group_order_idx').on(t.order)],
);

// Loại tài liệu được quản lý động theo từng lớp. Cùng một tên có thể được
// khai báo riêng cho các lớp khác nhau vì nhu cầu tài liệu không giống nhau.
export const documentTypes = pgTable(
  'document_types',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    level: educationLevelEnum('level').notNull(),
    grade: integer('grade').notNull(),
    order: integer('order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('document_type_grade_idx').on(t.level, t.grade, t.order)],
);

// Mức độ tài liệu. Key vẫn bám enum `difficulty` để không phá dữ liệu cũ,
// nhưng tên/màu/thứ tự/ẩn hiện được admin quản lý động.
export const difficultyLevels = pgTable(
  'difficulty_levels',
  {
    key: difficultyEnum('key').primaryKey(),
    name: text('name').notNull(),
    color: text('color').default('#0ea5e9').notNull(),
    order: integer('order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('difficulty_level_order_idx').on(t.order)],
);

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    level: educationLevelEnum('level').notNull(),
    grade: integer('grade').notNull(),
    programGroupId: uuid('program_group_id').references(
      () => programGroups.id,
      { onDelete: 'set null' },
    ),
    chapterId: uuid('chapter_id').references(() => chapters.id),
    documentTypeId: uuid('document_type_id').references(
      () => documentTypes.id,
      { onDelete: 'set null' },
    ),
    difficulty: difficultyEnum('difficulty').default('co_ban'),
    fileUrl: text('file_url').notNull(),
    fileSize: integer('file_size'),
    fileType: text('file_type'),
    pageCount: integer('page_count'),
    thumbnailUrl: text('thumbnail_url'),
    downloadCount: integer('download_count').default(0).notNull(),
    viewCount: integer('view_count').default(0).notNull(),
    rating: integer('rating').default(0),
    ratingCount: integer('rating_count').default(0),
    // Admin chọn hiển thị nổi bật ở trang chủ (không fix cứng).
    isFeatured: boolean('is_featured').default(false).notNull(),
    status: docStatusEnum('status').default('pending').notNull(),
    uploaderId: uuid('uploader_id').references(() => users.id),
    approvedById: uuid('approved_by_id').references(() => users.id),
    approvedAt: timestamp('approved_at'),
    rejectReason: text('reject_reason'),
    tags: jsonb('tags').$type<string[]>().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('doc_filter_idx').on(t.level, t.grade, t.status),
    index('doc_program_group_idx').on(t.programGroupId, t.status),
    index('doc_featured_idx').on(t.isFeatured, t.status),
    index('doc_status_idx').on(t.status),
    index('doc_uploader_idx').on(t.uploaderId),
  ],
);

export const downloads = pgTable('downloads', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id')
    .references(() => documents.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id').references(() => users.id),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const ratings = pgTable('ratings', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id')
    .references(() => documents.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  score: integer('score').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const documentsRelations = relations(documents, ({ one, many }) => ({
  chapter: one(chapters, {
    fields: [documents.chapterId],
    references: [chapters.id],
  }),
  programGroup: one(programGroups, {
    fields: [documents.programGroupId],
    references: [programGroups.id],
  }),
  documentType: one(documentTypes, {
    fields: [documents.documentTypeId],
    references: [documentTypes.id],
  }),
  uploader: one(users, {
    fields: [documents.uploaderId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [documents.approvedById],
    references: [users.id],
  }),
  downloads: many(downloads),
  ratings: many(ratings),
}));

export const chaptersRelations = relations(chapters, ({ many }) => ({
  documents: many(documents),
}));

export const programGroupsRelations = relations(programGroups, ({ many }) => ({
  documents: many(documents),
}));

export const documentTypesRelations = relations(documentTypes, ({ many }) => ({
  documents: many(documents),
}));

export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  downloads: many(downloads),
  ratings: many(ratings),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const downloadsRelations = relations(downloads, ({ one }) => ({
  document: one(documents, {
    fields: [downloads.documentId],
    references: [documents.id],
  }),
  user: one(users, { fields: [downloads.userId], references: [users.id] }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  document: one(documents, {
    fields: [ratings.documentId],
    references: [documents.id],
  }),
  user: one(users, { fields: [ratings.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;
export type ProgramGroup = typeof programGroups.$inferSelect;
export type NewProgramGroup = typeof programGroups.$inferInsert;
export type DocumentType = typeof documentTypes.$inferSelect;
export type NewDocumentType = typeof documentTypes.$inferInsert;
export type DifficultyLevel = typeof difficultyLevels.$inferSelect;
export type NewDifficultyLevel = typeof difficultyLevels.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Download = typeof downloads.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
