'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { DifficultyLevel } from '@/lib/db/schema';

type Draft = {
  key: DifficultyLevel['key'];
  name: string;
  color: string;
  order: number;
  isActive: boolean;
};

export function DifficultyLevelsClient({
  levels,
}: {
  levels: DifficultyLevel[];
}) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  function openEdit(level: DifficultyLevel) {
    setDraft({
      key: level.key,
      name: level.name,
      color: level.color,
      order: level.order,
      isActive: level.isActive,
    });
  }

  async function patchLevel(
    key: DifficultyLevel['key'],
    payload: Partial<Omit<Draft, 'key'>>,
  ) {
    const response = await fetch(`/api/admin/difficulty-levels/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error();
  }

  async function save() {
    if (!draft) return;
    if (draft.name.trim().length < 2) {
      toast.error('Tên tối thiểu 2 ký tự');
      return;
    }
    setSubmitting(true);
    try {
      await patchLevel(draft.key, {
        name: draft.name.trim(),
        color: draft.color,
        order: draft.order,
        isActive: draft.isActive,
      });
      toast.success('Đã cập nhật mức độ');
      setDraft(null);
      router.refresh();
    } catch {
      toast.error('Không thể lưu mức độ');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(level: DifficultyLevel) {
    try {
      await patchLevel(level.key, { isActive: !level.isActive });
      router.refresh();
    } catch {
      toast.error('Không thể đổi trạng thái');
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border bg-card/80 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">{levels.length} mức độ</p>
          <p className="text-xs text-muted-foreground">
            Quản lý label/màu/thứ tự; key kỹ thuật không đổi để giữ dữ liệu ổn định.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[minmax(220px,1fr)_160px_110px_120px_132px] gap-4 border-b bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Mức độ</span>
              <span>Key</span>
              <span>Thứ tự</span>
              <span>Trạng thái</span>
              <span className="text-right">Thao tác</span>
            </div>
            <div className="divide-y">
              {levels.map((level) => (
                <div
                  key={level.key}
                  className="grid grid-cols-[minmax(220px,1fr)_160px_110px_120px_132px] items-center gap-4 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="size-4 shrink-0 rounded-full ring-4 ring-background"
                      style={{ backgroundColor: level.color }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{level.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {level.color}
                      </p>
                    </div>
                  </div>
                  <code className="w-fit rounded-md bg-muted px-2 py-1 text-xs">
                    {level.key}
                  </code>
                  <span className="text-sm text-muted-foreground">
                    {level.order}
                  </span>
                  <Badge
                    variant={level.isActive ? 'secondary' : 'outline'}
                    className="w-fit rounded-full"
                  >
                    {level.isActive ? 'Hiện' : 'Ẩn'}
                  </Badge>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(level)}
                      title={level.isActive ? 'Ẩn' : 'Hiện'}
                    >
                      {level.isActive ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(level)}
                      title="Sửa"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!draft} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa mức độ</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-sm font-medium">Key kỹ thuật</p>
                <Input value={draft.key} disabled />
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Tên hiển thị</p>
                <Input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1 text-sm font-medium">Màu</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={draft.color}
                      onChange={(event) =>
                        setDraft({ ...draft, color: event.target.value })
                      }
                      className="h-10 w-12 cursor-pointer rounded-md border bg-transparent"
                    />
                    <Input
                      value={draft.color}
                      onChange={(event) =>
                        setDraft({ ...draft, color: event.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium">Thứ tự</p>
                  <Input
                    type="number"
                    value={draft.order}
                    onChange={(event) =>
                      setDraft({ ...draft, order: Number(event.target.value) })
                    }
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(event) =>
                    setDraft({ ...draft, isActive: event.target.checked })
                  }
                  className="size-4"
                />
                Hiển thị trong form tạo tài liệu
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Hủy
            </Button>
            <Button onClick={save} disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
