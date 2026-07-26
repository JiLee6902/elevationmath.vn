'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, ImageIcon, Loader2 } from 'lucide-react';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';
import { cn, formatBytes } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type UploadedFile = {
  file: File;
  fileUrl?: string;
  fileSize: number;
  fileType: string;
  thumbnailUrl?: string;
  uploading: boolean;
  error?: string;
};

type Props = {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  multiple?: boolean;
};

export function UploadZone({ files, onFilesChange, multiple = false }: Props) {
  const onDrop = React.useCallback(
    async (accepted: File[]) => {
      const newItems: UploadedFile[] = accepted.map((f) => ({
        file: f,
        fileSize: f.size,
        fileType: f.type,
        uploading: true,
      }));
      const next = multiple ? [...files, ...newItems] : newItems;
      onFilesChange(next);

      // Upload each file
      for (let i = 0; i < newItems.length; i++) {
        const idx = next.indexOf(newItems[i]);
        try {
          const fd = new FormData();
          fd.append('file', newItems[i].file);
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: fd,
          });
          if (!res.ok) throw new Error('Upload thất bại');
          const data = await res.json();
          next[idx] = {
            ...next[idx],
            uploading: false,
            fileUrl: data.fileUrl,
            thumbnailUrl: data.thumbnailUrl,
          };
        } catch (e) {
          next[idx] = {
            ...next[idx],
            uploading: false,
            error: e instanceof Error ? e.message : 'Lỗi',
          };
        }
        onFilesChange([...next]);
      }
    },
    [files, multiple, onFilesChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple,
  });

  function remove(index: number) {
    const next = [...files];
    next.splice(index, 1);
    onFilesChange(next);
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'rounded-lg border-2 border-dashed bg-card/40 p-10 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'hover:border-primary/50',
        )}
      >
        <input {...getInputProps()} />
        <Upload className="size-8 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium">
          {isDragActive
            ? 'Thả file vào đây để upload'
            : 'Kéo thả file vào đây hoặc click để chọn'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          PDF, DOCX, JPG, PNG, HEIC — tối đa {formatBytes(MAX_FILE_SIZE)}
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-md border bg-card"
            >
              <div className="size-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                {f.fileType.startsWith('image/') ? (
                  <ImageIcon className="size-4 text-muted-foreground" />
                ) : (
                  <FileText className="size-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {f.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(f.fileSize)}{' '}
                  {f.uploading && '· đang upload…'}
                  {f.error && (
                    <span className="text-destructive"> · {f.error}</span>
                  )}
                  {f.fileUrl && !f.error && (
                    <span className="text-emerald-600"> · sẵn sàng</span>
                  )}
                </p>
              </div>
              {f.uploading ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(i)}
                  aria-label="Xóa file"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
