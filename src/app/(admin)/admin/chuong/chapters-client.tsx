'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { LEVELS, type LevelKey } from '@/lib/constants';
import {
  chapterCreateSchema,
  type ChapterCreateInput,
} from '@/lib/validations/user';
import { slugify } from '@/lib/utils';
import type { Chapter } from '@/lib/db/schema';

export function ChaptersClient({ chapters }: { chapters: Chapter[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<{
    level: LevelKey;
    grade: number;
  }>({ level: 'thcs', grade: 7 });
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<ChapterCreateInput>({
    resolver: zodResolver(chapterCreateSchema),
    defaultValues: {
      level: 'thcs',
      grade: 7,
      number: 1,
      name: '',
      order: 0,
    },
  });

  const filtered = chapters.filter(
    (c) =>
      c.level === filter.level && c.grade === filter.grade,
  );

  async function onSubmit(values: ChapterCreateInput) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          slug: values.slug || slugify(values.name),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Đã thêm chương');
      setOpen(false);
      form.reset();
      router.refresh();
    } catch {
      toast.error('Lỗi');
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteChapter(id: string) {
    if (!confirm('Xóa chương này?')) return;
    try {
      const res = await fetch(`/api/admin/chapters/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      toast.success('Đã xóa');
      router.refresh();
    } catch {
      toast.error('Lỗi');
    }
  }

  return (
    <>
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Cấp</p>
            <Select
              value={filter.level}
              onValueChange={(v) =>
                setFilter({
                  ...filter,
                  level: v as LevelKey,
                  grade: LEVELS[v as LevelKey].grades[0],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LEVELS).map(([k, l]) => (
                  <SelectItem key={k} value={k}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Lớp</p>
            <Select
              value={String(filter.grade)}
              onValueChange={(v) =>
                setFilter({ ...filter, grade: Number(v) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVELS[filter.level].grades.map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    Lớp {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => {
              form.reset({
                level: filter.level,
                grade: filter.grade,
                number: filtered.length + 1,
                name: '',
                order: filtered.length,
              });
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            Thêm chương
          </Button>
        </div>
      </Card>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">
            Chưa có chương nào cho lớp {filter.grade}
          </Card>
        )}
        {filtered.map((ch) => (
          <Card
            key={ch.id}
            className="p-4 flex items-center gap-4"
          >
            <div className="size-9 rounded-md bg-primary/10 text-primary flex items-center justify-center font-semibold">
              {ch.number}
            </div>
            <div className="flex-1">
              <p className="font-medium">{ch.name}</p>
              {ch.description && (
                <p className="text-xs text-muted-foreground">
                  {ch.description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteChapter(ch.id)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm chương</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="chapter-form"
            >
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số chương</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thứ tự</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên chương</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              type="button"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="chapter-form"
              disabled={submitting}
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
