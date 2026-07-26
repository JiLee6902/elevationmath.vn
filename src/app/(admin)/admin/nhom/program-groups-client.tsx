'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, Loader2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { ProgramGroup } from '@/lib/db/schema';
import { cn, groupGradient } from '@/lib/utils';

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  order: number;
  isActive: boolean;
};

const EMPTY: Draft = {
  name: '',
  slug: '',
  description: '',
  color: '#0ea5e9',
  order: 0,
  isActive: true,
};

export function ProgramGroupsClient({ groups }: { groups: ProgramGroup[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);

  function openCreate() {
    setDraft({ ...EMPTY, order: groups.length });
    setOpen(true);
  }

  function openEdit(g: ProgramGroup) {
    setDraft({
      id: g.id,
      name: g.name,
      slug: g.slug,
      description: g.description ?? '',
      color: g.color,
      order: g.order,
      isActive: g.isActive,
    });
    setOpen(true);
  }

  async function save() {
    if (draft.name.trim().length < 2) {
      toast.error('Tên tối thiểu 2 ký tự');
      return;
    }
    setSubmitting(true);
    try {
      const editing = Boolean(draft.id);
      const url = editing
        ? `/api/admin/program-groups/${draft.id}`
        : '/api/admin/program-groups';
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          slug: draft.slug || undefined,
          description: draft.description || null,
          color: draft.color,
          order: draft.order,
          isActive: draft.isActive,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? 'Đã cập nhật' : 'Đã thêm nhóm');
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('Lỗi khi lưu');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(g: ProgramGroup) {
    try {
      const res = await fetch(`/api/admin/program-groups/${g.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !g.isActive }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error('Lỗi');
    }
  }

  async function remove(g: ProgramGroup) {
    if (!confirm(`Xoá nhóm "${g.name}"? Tài liệu thuộc nhóm sẽ bị bỏ gắn.`))
      return;
    try {
      const res = await fetch(`/api/admin/program-groups/${g.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      toast.success('Đã xoá');
      router.refresh();
    } catch {
      toast.error('Lỗi');
    }
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Thêm nhóm
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {groups.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">
            Chưa có nhóm nào. Bấm “Thêm nhóm” để tạo.
          </Card>
        )}
        {groups.map((g) => (
          <Card key={g.id} className="flex items-center gap-4 p-4">
            <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />
            <div
              className="size-10 shrink-0 rounded-xl"
              style={{ background: groupGradient(g.color) }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{g.name}</p>
                {!g.isActive && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Đang ẩn
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                /nhom/{g.slug}
                {g.description ? ` · ${g.description}` : ''}
              </p>
            </div>
            <button
              onClick={() => toggleActive(g)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                g.isActive
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {g.isActive ? 'Hiện' : 'Ẩn'}
            </button>
            <Button variant="ghost" size="icon" onClick={() => openEdit(g)}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => remove(g)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {draft.id ? 'Sửa nhóm chương trình' : 'Thêm nhóm chương trình'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Tên nhóm">
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="VD: Tài liệu luyện thi"
              />
            </Field>
            <Field label="Slug (để trống = tự tạo từ tên)">
              <Input
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                placeholder="luyen-thi"
              />
            </Field>
            <Field label="Mô tả">
              <Textarea
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
                rows={2}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Màu">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draft.color}
                    onChange={(e) =>
                      setDraft({ ...draft, color: e.target.value })
                    }
                    className="h-9 w-12 cursor-pointer rounded-md border bg-transparent"
                  />
                  <div
                    className="h-9 flex-1 rounded-md"
                    style={{ background: groupGradient(draft.color) }}
                  />
                </div>
              </Field>
              <Field label="Thứ tự">
                <Input
                  type="number"
                  value={draft.order}
                  onChange={(e) =>
                    setDraft({ ...draft, order: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) =>
                  setDraft({ ...draft, isActive: e.target.checked })
                }
                className="size-4"
              />
              Hiển thị trên trang người dùng
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={save} disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium">{label}</p>
      {children}
    </div>
  );
}
