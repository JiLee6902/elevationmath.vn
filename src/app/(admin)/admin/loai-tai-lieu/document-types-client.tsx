'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LEVELS, type LevelKey } from '@/lib/constants';
import type { DocumentType } from '@/lib/db/schema';

type Draft = {
  id?: string;
  name: string;
  level: LevelKey;
  grade: number;
  order: number;
  isActive: boolean;
};

const EMPTY: Draft = {
  name: '',
  level: 'tieu_hoc',
  grade: 1,
  order: 0,
  isActive: true,
};

export function DocumentTypesClient({
  documentTypes,
}: {
  documentTypes: DocumentType[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);

  function openCreate() {
    setDraft({ ...EMPTY, order: documentTypes.length + 1 });
    setOpen(true);
  }

  function openEdit(type: DocumentType) {
    setDraft({
      id: type.id,
      name: type.name,
      level: type.level as LevelKey,
      grade: type.grade,
      order: type.order,
      isActive: type.isActive,
    });
    setOpen(true);
  }

  async function save() {
    if (draft.name.trim().length < 2) return toast.error('Tên tối thiểu 2 ký tự');
    setSubmitting(true);
    try {
      const editing = Boolean(draft.id);
      const response = await fetch(
        editing ? `/api/admin/document-types/${draft.id}` : '/api/admin/document-types',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft),
        },
      );
      if (!response.ok) throw new Error();
      toast.success(editing ? 'Đã cập nhật loại tài liệu' : 'Đã thêm loại tài liệu');
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('Không thể lưu loại tài liệu');
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(type: DocumentType) {
    if (!confirm(`Xóa loại “${type.name}” của lớp ${type.grade}?`)) return;
    try {
      const response = await fetch(`/api/admin/document-types/${type.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error();
      toast.success('Đã xóa loại tài liệu');
      router.refresh();
    } catch {
      toast.error('Không thể xóa loại tài liệu đang được sử dụng');
    }
  }

  const grades = LEVELS[draft.level].grades;
  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus className="size-4" /> Thêm loại</Button>
      </div>
      <div className="grid gap-2">
        {documentTypes.map((type) => (
          <Card
            key={type.id}
            className="flex-row items-center gap-4 px-4 py-3"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
              L{type.grade}
            </div>
            <div className="grid min-w-0 flex-1 gap-0.5 md:grid-cols-[minmax(220px,1fr)_160px_100px] md:items-center">
              <div className="min-w-0">
                <p className="truncate font-medium">{type.name}</p>
                <p className="text-xs text-muted-foreground md:hidden">
                  {LEVELS[type.level as LevelKey].name} · Lớp {type.grade} · Thứ tự {type.order}
                </p>
              </div>
              <p className="hidden text-sm text-muted-foreground md:block">
                {LEVELS[type.level as LevelKey].name} · Lớp {type.grade}
              </p>
              <p className="hidden text-sm text-muted-foreground md:block">
                Thứ tự {type.order}
              </p>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-1">
              <button onClick={() => void fetch(`/api/admin/document-types/${type.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !type.isActive }) }).then(() => router.refresh())} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {type.isActive ? 'Hiện' : 'Đang ẩn'}
              </button>
              <Button variant="ghost" size="icon" onClick={() => openEdit(type)}><Pencil className="size-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => remove(type)}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{draft.id ? 'Sửa loại tài liệu' : 'Thêm loại tài liệu'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <label className="space-y-1.5 text-sm font-medium"><span>Tên loại</span><Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="VD: Phiếu rèn kỹ năng Tuần" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5 text-sm font-medium"><span>Cấp học</span><Select value={draft.level} onValueChange={(value) => { const level = value as LevelKey; setDraft({ ...draft, level, grade: LEVELS[level].grades[0] }); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(LEVELS).map(([key, item]) => <SelectItem key={key} value={key}>{item.name}</SelectItem>)}</SelectContent></Select></label>
              <label className="space-y-1.5 text-sm font-medium"><span>Lớp</span><Select value={String(draft.grade)} onValueChange={(value) => setDraft({ ...draft, grade: Number(value) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{grades.map((grade) => <SelectItem key={grade} value={String(grade)}>Lớp {grade}</SelectItem>)}</SelectContent></Select></label>
            </div>
            <label className="space-y-1.5 text-sm font-medium"><span>Thứ tự</span><Input type="number" value={draft.order} onChange={(event) => setDraft({ ...draft, order: Number(event.target.value) })} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} className="size-4" /> Hiển thị để chọn khi tạo tài liệu</label>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button><Button onClick={save} disabled={submitting}>{submitting && <Loader2 className="size-4 animate-spin" />}{draft.id ? 'Cập nhật' : 'Thêm loại'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
