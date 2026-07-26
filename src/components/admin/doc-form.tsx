'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  UploadZone,
  type UploadedFile,
} from '@/components/user/upload-zone';
import {
  DIFFICULTIES,
  DOC_STATUS,
  LEVELS,
  type LevelKey,
} from '@/lib/constants';
import {
  documentCreateSchema,
  type DocumentCreateInput,
} from '@/lib/validations/document';
import type {
  Chapter,
  Document,
  DocumentType,
  ProgramGroup,
} from '@/lib/db/schema';
import { slugify } from '@/lib/utils';

type Props = {
  doc?: Document;
  chapters: Chapter[];
  programGroups: ProgramGroup[];
  documentTypes: DocumentType[];
};

export function DocForm({ doc, chapters, programGroups, documentTypes }: Props) {
  const router = useRouter();
  const editing = !!doc;
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [tagsInput, setTagsInput] = React.useState(
    doc?.tags?.join(', ') ?? '',
  );
  const [status, setStatus] = React.useState<string>(doc?.status ?? 'pending');
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<DocumentCreateInput>({
    resolver: zodResolver(documentCreateSchema),
    defaultValues: {
      title: doc?.title ?? '',
      slug: doc?.slug ?? '',
      description: doc?.description ?? '',
      level: (doc?.level as LevelKey) ?? 'thcs',
      grade: doc?.grade ?? 7,
      programGroupId: doc?.programGroupId ?? null,
      chapterId: doc?.chapterId ?? null,
      documentTypeId: doc?.documentTypeId ?? '',
      difficulty: doc?.difficulty ?? 'co_ban',
      fileUrl: doc?.fileUrl ?? '',
      fileSize: doc?.fileSize ?? undefined,
      fileType: doc?.fileType ?? undefined,
      thumbnailUrl: doc?.thumbnailUrl ?? null,
      isFeatured: doc?.isFeatured ?? false,
      tags: doc?.tags ?? [],
    },
  });

  const level = form.watch('level');
  const grade = form.watch('grade');
  const filteredChapters = chapters.filter(
    (c) => c.level === level && c.grade === grade,
  );
  const filteredDocumentTypes = documentTypes.filter(
    (type) => type.level === level && type.grade === grade && type.isActive,
  );

  async function onSubmit(values: DocumentCreateInput) {
    const ready = files.find((f) => f.fileUrl && !f.error);
    const finalUrl = ready?.fileUrl ?? values.fileUrl ?? doc?.fileUrl;
    if (!finalUrl) {
      toast.error('Vui lòng upload file');
      return;
    }

    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const payload = {
        ...values,
        slug: values.slug || slugify(values.title),
        fileUrl: finalUrl,
        fileSize: ready?.fileSize ?? values.fileSize ?? doc?.fileSize,
        fileType: ready?.fileType ?? values.fileType ?? doc?.fileType,
        thumbnailUrl: ready?.thumbnailUrl ?? doc?.thumbnailUrl ?? null,
        tags,
        status: editing ? status : 'approved',
      };
      const res = await fetch(
        editing ? `/api/documents/${doc.id}` : '/api/documents',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Lỗi');
      }
      toast.success(editing ? 'Đã cập nhật' : 'Đã tạo tài liệu');
      router.push('/admin/tai-lieu');
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-3xl"
      >
        {!editing && (
          <div>
            <p className="text-sm font-medium mb-2">File tài liệu</p>
            <UploadZone files={files} onFilesChange={setFiles} />
          </div>
        )}

        {editing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">File hiện tại</p>
              <a
                href={doc?.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Xem file
              </a>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Trạng thái</p>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOC_STATUS).map(([k, s]) => (
                    <SelectItem key={k} value={k}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cấp học</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    form.setValue('documentTypeId', '');
                    const grades = LEVELS[v as LevelKey].grades;
                    if (!grades.includes(grade as never)) {
                      form.setValue('grade', grades[0]);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(LEVELS).map(([k, l]) => (
                      <SelectItem key={k} value={k}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lớp</FormLabel>
                <Select
                  value={String(field.value)}
                  onValueChange={(v) => {
                    field.onChange(Number(v));
                    form.setValue('documentTypeId', '');
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LEVELS[level as LevelKey].grades.map((g) => (
                      <SelectItem key={g} value={String(g)}>
                        Lớp {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        <FormField
          control={form.control}
          name="chapterId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chương</FormLabel>
              <Select
                value={field.value ?? '__none'}
                onValueChange={(v) =>
                  field.onChange(v === '__none' ? null : v)
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chương" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none">— Không chọn —</SelectItem>
                  {filteredChapters.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id}>
                      {ch.number}. {ch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {programGroups.length > 0 && (
          <FormField
            control={form.control}
            name="programGroupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nhóm chương trình</FormLabel>
                <Select
                  value={field.value ?? '__none'}
                  onValueChange={(v) =>
                    field.onChange(v === '__none' ? null : v)
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhóm" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none">— Không chọn —</SelectItem>
                    {programGroups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="documentTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại tài liệu</FormLabel>
                <Select
                  value={field.value || '__none'}
                  onValueChange={(value) => field.onChange(value === '__none' ? '' : value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none" disabled>
                      Chọn loại tài liệu
                    </SelectItem>
                    {filteredDocumentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mức độ</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(DIFFICULTIES).map(([k, d]) => (
                      <SelectItem key={k} value={k}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Tags</p>
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Cách nhau bằng dấu phẩy"
          />
        </div>

        <label className="flex items-center gap-2.5 rounded-lg border bg-card p-3 text-sm">
          <input
            type="checkbox"
            checked={!!form.watch('isFeatured')}
            onChange={(e) => form.setValue('isFeatured', e.target.checked)}
            className="size-4"
          />
          <span>
            <span className="font-medium">Hiển thị ở trang chủ</span>
            <span className="block text-xs text-muted-foreground">
              Tài liệu nổi bật xuất hiện trong cụm bìa &amp; mục “Tài liệu nổi
              bật” trên trang chủ.
            </span>
          </span>
        </label>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {editing ? 'Cập nhật' : 'Tạo tài liệu'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Hủy
          </Button>
        </div>
      </form>
    </Form>
  );
}
