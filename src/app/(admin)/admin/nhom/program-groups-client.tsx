'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
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

      <div className="mt-4 overflow-hidden rounded-xl border bg-card">
        {groups.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">
            Chưa có nhóm nào. Bấm “Thêm nhóm” để tạo.
          </Card>
        )}
        {groups.length > 0 && (
          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[40px_minmax(260px,1fr)_minmax(320px,1.4fr)_90px_110px_132px] gap-4 border-b bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span />
                <span>Nhóm</span>
                <span>Mô tả / đường dẫn</span>
                <span>Thứ tự</span>
                <span>Trạng thái</span>
                <span className="text-right">Thao tác</span>
              </div>

              <div className="divide-y">
                {groups.map((g) => (
                  <div
                    key={g.id}
                    className="grid grid-cols-[40px_minmax(260px,1fr)_minmax(320px,1.4fr)_90px_110px_132px] items-center gap-4 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />
                      <div
                        className="size-5 shrink-0 rounded-full ring-4 ring-background"
                        style={{ background: groupGradient(g.color) }}
                        aria-hidden
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">{g.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {g.color}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm text-muted-foreground">
                        {g.description || 'Chưa có mô tả'}
                      </p>
                      <p className="truncate text-xs text-primary">
                        /nhom/{g.slug}
                      </p>
                    </div>

                    <span className="text-sm text-muted-foreground">
                      {g.order}
                    </span>

                    <Badge
                      variant={g.isActive ? 'secondary' : 'outline'}
                      className={cn(
                        'rounded-full',
                        g.isActive &&
                          'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
                      )}
                    >
                      {g.isActive ? 'Hiện' : 'Ẩn'}
                    </Badge>

                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(g)}
                        title={g.isActive ? 'Ẩn' : 'Hiện'}
                      >
                        {g.isActive ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeOff className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(g)}
                        title="Sửa"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(g)}
                        title="Xóa"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
