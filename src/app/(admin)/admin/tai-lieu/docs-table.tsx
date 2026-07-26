'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Pencil, Star } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DOC_STATUS,
  type DocStatusKey,
} from '@/lib/constants';
import { cn, formatNumber } from '@/lib/utils';
import type { Document, DocumentType } from '@/lib/db/schema';

type DocRow = Document & { documentType?: DocumentType | null };

/** Nút sao: ghim/bỏ ghim tài liệu lên trang chủ (is_featured). */
function FeatureStar({ id, featured }: { id: string; featured: boolean }) {
  const router = useRouter();
  const [on, setOn] = React.useState(featured);
  const [busy, setBusy] = React.useState(false);

  async function toggle() {
    const next = !on;
    setBusy(true);
    setOn(next); // optimistic
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? 'Đã ghim lên trang chủ' : 'Đã bỏ ghim');
      router.refresh();
    } catch {
      setOn(!next); // rollback
      toast.error('Lỗi');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={on ? 'Bỏ nổi bật' : 'Hiện ở trang chủ'}
      className="inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-accent disabled:opacity-50"
    >
      <Star
        className={cn(
          'size-4 transition-colors',
          on ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground',
        )}
      />
    </button>
  );
}

export function DocsTable({ docs }: { docs: DocRow[] }) {
  const columns: ColumnDef<DocRow>[] = [
    {
      id: 'featured',
      header: 'Nổi bật',
      cell: ({ row }) => (
        <FeatureStar
          id={row.original.id}
          featured={row.original.isFeatured}
        />
      ),
    },
    {
      accessorKey: 'title',
      header: 'Tiêu đề',
      cell: ({ row }) => (
        <Link
          href={`/admin/tai-lieu/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: 'grade',
      header: 'Lớp',
      cell: ({ row }) => (
        <Badge variant="secondary">
          Lớp {row.original.grade}
        </Badge>
      ),
    },
    {
      accessorKey: 'documentTypeId',
      header: 'Loại',
      cell: ({ row }) => row.original.documentType?.name ?? '—',
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const s = DOC_STATUS[row.original.status as DocStatusKey];
        return (
          <Badge variant="secondary" className={s.color}>
            {s.name}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'downloadCount',
      header: 'Tải về',
      cell: ({ row }) => formatNumber(row.original.downloadCount),
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày',
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), 'dd/MM/yyyy'),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link href={`/admin/tai-lieu/${row.original.id}`}>
          <Button variant="ghost" size="sm">
            <Pencil className="size-3.5" />
          </Button>
        </Link>
      ),
    },
  ];

  return <DataTable columns={columns} data={docs} pageSize={20} />;
}
