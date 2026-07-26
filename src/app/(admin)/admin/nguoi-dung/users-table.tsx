'use client';

import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { DataTable } from '@/components/admin/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  USER_ROLES,
  type UserRoleKey,
} from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import type { User } from '@/lib/db/schema';

export function UsersTable({ users }: { users: User[] }) {
  const router = useRouter();

  async function changeRole(id: string, role: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      toast.success('Đã cập nhật role');
      router.refresh();
    } catch {
      toast.error('Lỗi cập nhật');
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'fullName',
      header: 'Người dùng',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            {row.original.avatarUrl && (
              <AvatarImage src={row.original.avatarUrl} />
            )}
            <AvatarFallback className="text-xs">
              {getInitials(row.original.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.fullName ?? '—'}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role as UserRoleKey;
        return (
          <Select
            value={role}
            onValueChange={(v) => changeRole(row.original.id, v)}
          >
            <SelectTrigger className="w-36 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(USER_ROLES).map(([k, r]) => (
                <SelectItem key={k} value={k}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: 'points',
      header: 'Điểm',
    },
    {
      accessorKey: 'uploadCount',
      header: 'Upload',
    },
    {
      accessorKey: 'isVerified',
      header: 'Verified',
      cell: ({ row }) =>
        row.original.isVerified ? (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            Verified
          </Badge>
        ) : (
          <Badge variant="outline">Chưa</Badge>
        ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Đăng ký',
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), 'dd/MM/yyyy'),
    },
  ];

  return <DataTable columns={columns} data={users} />;
}
