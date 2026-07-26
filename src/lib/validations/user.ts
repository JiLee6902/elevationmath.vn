import { z } from 'zod';

export const userUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  role: z
    .enum(['student', 'teacher', 'admin', 'super_admin'])
    .optional(),
  isVerified: z.boolean().optional(),
});

export const chapterCreateSchema = z.object({
  level: z.enum(['tieu_hoc', 'thcs', 'thpt']),
  grade: z.number().int().min(1).max(12),
  number: z.number().int().min(1),
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  order: z.number().int().default(0),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type ChapterCreateInput = z.input<typeof chapterCreateSchema>;
export type ChapterCreateOutput = z.output<typeof chapterCreateSchema>;
