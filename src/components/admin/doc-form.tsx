'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  BadgeCheck,
  ExternalLink,
  FileText,
  Layers3,
  Loader2,
  Save,
  Sparkles,
  Tags,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
        className="space-y-6"
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </span>
                  <div>
                    <CardTitle>Nội dung tài liệu</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Tên, mô tả và thông tin hiển thị ngoài website.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10 text-base" />
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
                        <Textarea
                          rows={5}
                          {...field}
                          value={field.value ?? ''}
                          className="min-h-32 resize-y"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                    <Layers3 className="size-4" />
                  </span>
                  <div>
                    <CardTitle>Phân loại</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Cấp/lớp quyết định chương và loại tài liệu được chọn.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid gap-4 md:grid-cols-2">
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
                            <SelectTrigger className="h-10">
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
                            <SelectTrigger className="h-10">
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
                            <SelectTrigger className="h-10">
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
                              <SelectTrigger className="h-10">
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

                  <FormField
                    control={form.control}
                    name="documentTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại tài liệu</FormLabel>
                        <Select
                          value={field.value || '__none'}
                          onValueChange={(value) =>
                            field.onChange(value === '__none' ? '' : value)
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
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
                            <SelectTrigger className="h-10">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                    <Tags className="size-4" />
                  </span>
                  <div>
                    <CardTitle>Tags & hiển thị</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Tối ưu tìm kiếm và chọn tài liệu nổi bật.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Tags</p>
                  <Input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Cách nhau bằng dấu phẩy"
                    className="h-10"
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/30 p-4 text-sm transition-colors hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={!!form.watch('isFeatured')}
                    onChange={(e) => form.setValue('isFeatured', e.target.checked)}
                    className="mt-0.5 size-4"
                  />
                  <span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="size-4 text-primary" />
                      Hiển thị ở trang chủ
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Tài liệu nổi bật xuất hiện trong cụm bìa &amp; mục “Tài
                      liệu nổi bật” trên trang chủ.
                    </span>
                  </span>
                </label>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <Card className="border-primary/15">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>Kiểm soát</CardTitle>
                  {editing && (
                    <Badge variant="secondary" className="rounded-full">
                      {DOC_STATUS[status as keyof typeof DOC_STATUS]?.name ?? status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {editing ? (
                  <>
                    <div className="rounded-xl border bg-muted/30 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        File hiện tại
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        className="mt-3 w-full justify-between"
                      >
                        <a href={doc?.fileUrl} target="_blank" rel="noreferrer">
                          Xem file <ExternalLink className="size-4" />
                        </a>
                      </Button>
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-medium">Trạng thái duyệt</p>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="h-10">
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
                  </>
                ) : (
                  <div>
                    <p className="mb-2 text-sm font-medium">File tài liệu</p>
                    <UploadZone files={files} onFilesChange={setFiles} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <BadgeCheck className="mb-1 size-4" />
                    <p className="font-semibold">Lưu an toàn</p>
                    <p className="text-primary/70">Giữ file cũ nếu không upload mới.</p>
                  </div>
                  <div className="rounded-xl bg-muted p-3 text-muted-foreground">
                    <FileText className="mb-1 size-4" />
                    <p className="font-semibold text-foreground">Metadata</p>
                    <p>Tự đồng bộ khi đổi cấp/lớp.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-2 pt-4">
                <Button type="submit" disabled={submitting} className="w-full" size="lg">
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {editing ? 'Cập nhật tài liệu' : 'Tạo tài liệu'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full"
                >
                  <X className="size-4" />
                  Hủy
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </form>
    </Form>
  );
}
