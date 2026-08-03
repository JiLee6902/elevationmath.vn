import { z } from 'zod';

export const documentCreateSchema = z.object({
  title: z.string().min(3, 'Tiêu đề tối thiểu 3 ký tự').max(200),
  slug: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  level: z.enum(['tieu_hoc', 'thcs', 'thpt']),
  grade: z.number().int().min(1).max(12),
  programGroupId: z.string().uuid().optional().nullable(),
  chapterId: z.string().uuid().optional().nullable(),
  documentTypeId: z.string().uuid('Vui lòng chọn loại tài liệu'),
  difficulty: z.enum(['co_ban', 'nang_cao']).default('co_ban'),
  fileUrl: z.string().url('File chưa được upload'),
  fileSize: z.number().int().positive().optional(),
  fileType: z.string().optional(),
  pageCount: z.number().int().positive().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string()).default([]),
});

export const documentUpdateSchema = documentCreateSchema.partial().extend({
  status: z
    .enum(['pending', 'approved', 'rejected', 'archived'])
    .optional(),
  rejectReason: z.string().max(500).optional().nullable(),
});

export const documentRejectSchema = z.object({
  reason: z.string().min(3, 'Lý do tối thiểu 3 ký tự').max(500),
});

export const programGroupCreateSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(120),
  slug: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Màu phải dạng hex #RRGGBB')
    .default('#0ea5e9'),
  order: z.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
});

export const programGroupUpdateSchema = programGroupCreateSchema.partial();

export type ProgramGroupCreateInput = z.input<typeof programGroupCreateSchema>;

export const documentTypeCreateSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(120),
  slug: z.string().min(2).max(160).optional(),
  level: z.enum(['tieu_hoc', 'thcs', 'thpt']),
  grade: z.number().int().min(1).max(12),
  order: z.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
});

export const documentTypeUpdateSchema = documentTypeCreateSchema.partial();

export const difficultyLevelUpdateSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(80).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Màu phải dạng hex #RRGGBB')
    .optional(),
  order: z.number().int().min(0).max(999).optional(),
  isActive: z.boolean().optional(),
});

export const ratingSchema = z.object({
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type DocumentCreateInput = z.input<typeof documentCreateSchema>;
export type DocumentCreateOutput = z.output<typeof documentCreateSchema>;
export type DocumentUpdateInput = z.input<typeof documentUpdateSchema>;
export type DocumentRejectInput = z.infer<typeof documentRejectSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
