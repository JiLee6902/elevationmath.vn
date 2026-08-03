'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LEVELS, type LevelKey } from '@/lib/constants';
import type { DocumentType } from '@/lib/db/schema';

type Draft = {
  key?: string;
  name: string;
  grades: number[];
  order: number;
  isActive: boolean;
};

const EMPTY: Draft = {
  name: '',
  grades: [1],
  order: 0,
  isActive: true,
};

type DocumentTypeGroup = {
  key: string;
  name: string;
  grades: number[];
  order: number;
  isActive: boolean;
  items: DocumentType[];
};

const LEVEL_BY_GRADE = new Map<number, LevelKey>(
  Object.entries(LEVELS).flatMap(([level, item]) =>
    item.grades.map((grade) => [grade, level as LevelKey]),
  ),
);

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase('vi-VN');
}

function groupDocumentTypes(documentTypes: DocumentType[]) {
  const map = new Map<string, DocumentTypeGroup>();
  for (const type of documentTypes) {
    const key = normalizeName(type.name);
    const current = map.get(key);
    if (current) {
      current.items.push(type);
      current.grades.push(type.grade);
      current.order = Math.min(current.order, type.order);
      current.isActive = current.isActive || type.isActive;
      continue;
    }
    map.set(key, {
      key,
      name: type.name,
      grades: [type.grade],
      order: type.order,
      isActive: type.isActive,
      items: [type],
    });
  }
  return Array.from(map.values())
    .map((group) => ({
      ...group,
      grades: Array.from(new Set(group.grades)).sort((a, b) => a - b),
      items: group.items.sort((a, b) => a.grade - b.grade),
    }))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'vi'));
}

export function DocumentTypesClient({
  documentTypes,
}: {
  documentTypes: DocumentType[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);
  const groups = React.useMemo(
    () => groupDocumentTypes(documentTypes),
    [documentTypes],
  );

  function openCreate() {
    setDraft({ ...EMPTY, order: groups.length + 1 });
    setOpen(true);
  }

  function openEdit(group: DocumentTypeGroup) {
    setDraft({
      key: group.key,
      name: group.name,
      grades: group.grades,
      order: group.order,
      isActive: group.isActive,
    });
    setOpen(true);
  }

  async function save() {
    if (draft.name.trim().length < 2) return toast.error('Tên tối thiểu 2 ký tự');
    if (draft.grades.length === 0) return toast.error('Chọn ít nhất 1 lớp');
    setSubmitting(true);
    try {
      const editing = Boolean(draft.key);
      const currentGroup = editing
        ? groups.find((group) => group.key === draft.key)
        : undefined;
      const currentByGrade = new Map(
        (currentGroup?.items ?? []).map((item) => [item.grade, item]),
      );
      const selectedGrades = new Set(draft.grades);

      await Promise.all(
        (currentGroup?.items ?? [])
          .filter((item) => !selectedGrades.has(item.grade))
          .map((item) =>
            fetch(`/api/admin/document-types/${item.id}`, { method: 'DELETE' })
              .then((response) => {
                if (!response.ok) throw new Error();
              }),
          ),
      );

      await Promise.all(
        draft.grades.map((grade) => {
          const level = LEVEL_BY_GRADE.get(grade);
          if (!level) throw new Error('Invalid grade');
          const existing = currentByGrade.get(grade);
          const payload = {
            name: draft.name.trim(),
            level,
            grade,
            order: draft.order,
            isActive: draft.isActive,
          };
          return fetch(
            existing
              ? `/api/admin/document-types/${existing.id}`
              : '/api/admin/document-types',
            {
              method: existing ? 'PATCH' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            },
          ).then((response) => {
            if (!response.ok) throw new Error();
          });
        }),
      );

      toast.success(editing ? 'Đã cập nhật loại tài liệu' : 'Đã thêm loại tài liệu');
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('Không thể lưu loại tài liệu');
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(group: DocumentTypeGroup) {
    if (!confirm(`Xóa loại “${group.name}” khỏi ${group.grades.length} lớp?`)) return;
    try {
      await Promise.all(
        group.items.map((item) =>
          fetch(`/api/admin/document-types/${item.id}`, { method: 'DELETE' })
            .then((response) => {
              if (!response.ok) throw new Error();
            }),
        ),
      );
      toast.success('Đã xóa loại tài liệu');
      router.refresh();
    } catch {
      toast.error('Không thể xóa loại tài liệu đang được sử dụng');
    }
  }

  async function toggleActive(group: DocumentTypeGroup) {
    try {
      await Promise.all(
        group.items.map((item) =>
          fetch(`/api/admin/document-types/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !group.isActive }),
          }).then((response) => {
            if (!response.ok) throw new Error();
          }),
        ),
      );
      router.refresh();
    } catch {
      toast.error('Không thể đổi trạng thái');
    }
  }

  function toggleDraftGrade(grade: number) {
    setDraft((current) => {
      const grades = current.grades.includes(grade)
        ? current.grades.filter((item) => item !== grade)
        : [...current.grades, grade].sort((a, b) => a - b);
      return { ...current, grades };
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus className="size-4" /> Thêm loại</Button>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <div className="min-w-[780px]">
            <div className="grid grid-cols-[minmax(260px,1fr)_minmax(260px,1.3fr)_90px_132px] gap-4 border-b bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Loại tài liệu</span>
              <span>Lớp áp dụng</span>
              <span>Thứ tự</span>
              <span className="text-right">Thao tác</span>
            </div>
            <div className="divide-y">
              {groups.map((group) => (
                <div
                  key={group.key}
                  className="grid grid-cols-[minmax(260px,1fr)_minmax(260px,1.3fr)_90px_132px] items-center gap-4 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{group.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {group.grades.length} lớp · {group.isActive ? 'Đang hiển thị' : 'Đang ẩn'}
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-wrap gap-1.5">
                    {group.grades.map((grade) => (
                      <Badge key={grade} variant="secondary" className="rounded-full">
                        L{grade}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{group.order}</span>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => toggleActive(group)} title={group.isActive ? 'Ẩn' : 'Hiện'}>
                      {group.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(group)} title="Sửa"><Pencil className="size-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(group)} title="Xóa"><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{draft.key ? 'Sửa loại tài liệu' : 'Thêm loại tài liệu'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <label className="space-y-1.5 text-sm font-medium"><span>Tên loại</span><Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="VD: Phiếu rèn kỹ năng Tuần" /></label>
            <div className="space-y-2">
              <p className="text-sm font-medium">Lớp áp dụng</p>
              <div className="grid gap-3 rounded-xl border p-3 sm:grid-cols-3">
                {Object.entries(LEVELS).map(([level, item]) => (
                  <div key={level} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.grades.map((grade) => (
                        <label key={grade} className="flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-sm">
                          <Checkbox
                            checked={draft.grades.includes(grade)}
                            onCheckedChange={() => toggleDraftGrade(grade)}
                          />
                          Lớp {grade}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <label className="space-y-1.5 text-sm font-medium"><span>Thứ tự</span><Input type="number" value={draft.order} onChange={(event) => setDraft({ ...draft, order: Number(event.target.value) })} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} className="size-4" /> Hiển thị để chọn khi tạo tài liệu</label>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button><Button onClick={save} disabled={submitting}>{submitting && <Loader2 className="size-4 animate-spin" />}{draft.key ? 'Cập nhật' : 'Thêm loại'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
