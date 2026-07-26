import type {
  Document,
  User,
  Chapter,
  DocumentType,
  Download,
  Rating,
} from '@/lib/db/schema';

export type { Document, User, Chapter, DocumentType, Download, Rating };

export type DocumentWithRelations = Document & {
  chapter?: Chapter | null;
  documentType?: DocumentType | null;
  uploader?: Pick<User, 'id' | 'fullName' | 'email' | 'avatarUrl'> | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type DocumentSort = 'newest' | 'popular' | 'top_rated';

export type DocumentFilter = {
  level?: string;
  grade?: number;
  grades?: number[];
  programGroupId?: string;
  chapterIds?: string[];
  documentTypeIds?: string[];
  difficulties?: string[];
  status?: string;
  search?: string;
  uploaderId?: string;
  sort?: DocumentSort;
};

export type Stats = {
  totalDocuments: number;
  pendingDocuments: number;
  totalUsers: number;
  monthDownloads: number;
  downloadsByDay: { date: string; count: number }[];
};
