'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Check, X, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { DataTable } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatBytes } from '@/lib/utils';
import type { Document, DocumentType } from '@/lib/db/schema';

type Row = Document & { documentType?: DocumentType | null };

export function PendingTable({ docs }: { docs: Row[] }) {
  const router = useRouter();
  const [previewDoc, setPreviewDoc] = React.useState<Row | null>(null);
  const [rejectDoc, setRejectDoc] = React.useState<Row | null>(null);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  async function approve(id: string) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/approve/${id}`, { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('Đã duyệt');
      router.refresh();
    } catch {
      toast.error('Duyệt thất bại');
    } finally {
      setLoadingId(null);
    }
  }

  async function reject(reason?: string) {
    if (!rejectDoc || !reason) return;
    setLoadingId(rejectDoc.id);
    try {
      const res = await fetch(`/api/admin/reject/${rejectDoc.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error();
      toast.success('Đã từ chối');
      setRejectDoc(null);
      router.refresh();
    } catch {
      toast.error('Lỗi');
    } finally {
      setLoadingId(null);
    }
  }

  const columns: ColumnDef<Row>[] = [
    {
      accessorKey: 'title',
      header: 'Tiêu đề',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.title}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.fileType} ·{' '}
            {row.original.fileSize
              ? formatBytes(row.original.fileSize)
              : '—'}
          </span>
        </div>
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
      accessorKey: 'createdAt',
      header: 'Ngày upload',
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), 'dd/MM/yyyy'),
    },
    {
      id: 'actions',
      header: 'Hành động',
      cell: ({ row }) => {
        const id = row.original.id;
        const loading = loadingId === id;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewDoc(row.original)}
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => approve(id)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Duyệt
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectDoc(row.original)}
              disabled={loading}
            >
              <X className="size-4" />
              Từ chối
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={docs}
        emptyMessage="Không có tài liệu chờ duyệt"
      />

      <Dialog
        open={!!previewDoc}
        onOpenChange={(o) => !o && setPreviewDoc(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewDoc?.title}</DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="aspect-video bg-muted rounded">
              {previewDoc.fileType?.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={previewDoc.fileUrl}
                  className="w-full h-full"
                  title={previewDoc.title}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!rejectDoc}
        onOpenChange={(o) => !o && setRejectDoc(null)}
        title="Từ chối tài liệu"
        description={`"${rejectDoc?.title ?? ''}" sẽ không được hiển thị công khai.`}
        confirmLabel="Từ chối"
        destructive
        needReason
        onConfirm={reject}
        loading={loadingId === rejectDoc?.id}
      />
    </>
  );
}
