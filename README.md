# Elevation Math

Nền tảng học toán cho học sinh Việt Nam từ lớp 1 đến lớp 12. Tài liệu lý thuyết, bài tập, đề kiểm tra và đề thi học sinh giỏi, được tổ chức theo lớp và mục tiêu học tập.

App gồm hai phần trong cùng một Next.js project:

- **User public** (`(user)` route group): trang chủ, trang theo cấp / lớp / chương trình, trang chi tiết tài liệu, upload.
- **Admin panel** (`(admin)` route group): dashboard, duyệt bài, quản lý tài liệu / người dùng / chương / thống kê.

## Tech stack

- Next.js 16 App Router + React 19 + TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui
- Postgres + Drizzle ORM + drizzle-kit
- Auth tự host: bcryptjs (password) + cookie session (table `sessions`)
- Storage tự host: MinIO (S3-compatible) qua `@aws-sdk/client-s3`
- React Hook Form + Zod, TanStack Table, recharts, react-dropzone
- next-themes (dark mode), sonner (toast), cmdk (Cmd+K)

## Setup local

### 1. Postgres + MinIO local

Cách nhanh nhất: chạy đúng `docker compose up postgres minio minio-init` từ project (cùng compose dùng cho prod). Hoặc tự cài Postgres + MinIO local.

### 2. Cấu hình env

Copy `.env.example` → `.env.local` và điền:

```env
DATABASE_URL=postgresql://mathverse:password@localhost:5432/mathverse

S3_ENDPOINT=http://localhost:9000
S3_PUBLIC_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=mathverse
S3_SECRET_KEY=change-me

NEXT_PUBLIC_APP_URL=http://localhost:3000

ADMIN_EMAIL=admin@elevationmath.vn
ADMIN_PASSWORD=ChangeMe123!
```

### 3. Cài deps + migrate + seed

```bash
npm install
npm run db:push         # đẩy schema lên database
npm run db:seed         # tạo admin + chapters + sample docs
npm run dev             # http://localhost:3000
```

Sau khi seed xong:

- Truy cập `/dang-nhap`, login bằng `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Vào `/admin` để dùng admin panel.

## Scripts

| Lệnh                  | Mục đích                                             |
|-----------------------|------------------------------------------------------|
| `npm run dev`         | Dev server (port 3000, turbopack)                    |
| `npm run build`       | Build production                                     |
| `npm run start`       | Start production server                              |
| `npm run lint`        | Lint                                                 |
| `npm run db:generate` | Sinh migration từ schema                             |
| `npm run db:migrate`  | Chạy migration                                       |
| `npm run db:push`     | Đẩy schema thẳng lên DB (dev nhanh, không sinh file) |
| `npm run db:studio`   | Mở Drizzle Studio                                    |
| `npm run db:seed`     | Tạo admin + chapters + sample docs                   |

## Cấu trúc thư mục

```
src/
├── app/
│   ├── (user)/                     # User public (route group)
│   │   ├── layout.tsx
│   │   ├── page.tsx                # /
│   │   ├── tieu-hoc, thcs, thpt    # Level pages + lop-[grade]
│   │   ├── tai-lieu/[slug]/        # Chi tiết tài liệu
│   │   └── upload/
│   ├── (admin)/                    # Admin (route group, gated)
│   │   ├── layout.tsx              # Sidebar + Topbar
│   │   └── admin/                  # 7 menu mục
│   ├── (auth)/                     # Login / register
│   ├── api/
│   │   ├── auth/{login,register,logout}/  # Auth endpoints
│   │   ├── upload/                         # Upload → MinIO
│   │   └── documents/[id]/download/        # Presigned URL từ MinIO
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                         # shadcn/ui
│   ├── user/                       # Header, MegaMenu, SubNav, …
│   ├── admin/                      # Sidebar, Topbar, DataTable, …
│   └── shared/
├── lib/
│   ├── auth.ts                     # getCurrentUser, requireUser/Admin
│   ├── session.ts                  # Session table + cookie
│   ├── password.ts                 # bcryptjs wrapper
│   ├── storage.ts                  # MinIO S3 client + presigned URL
│   ├── db/{schema,index,queries,seed}.ts
│   ├── validations/{auth,document,user}.ts
│   ├── constants.ts
│   └── utils.ts
├── proxy.ts                        # Next 16: bảo vệ /admin và /upload
└── types/
```

## Deploy

Xem [DEPLOY.md](./DEPLOY.md) — Docker Compose lên Hetzner Singapore (~€4.5/tháng).

## Troubleshooting

- **`DATABASE_URL is not set`**: kiểm tra `.env.local` đã được tạo và điền đầy đủ.
- **Upload bị 401**: phải đăng nhập trước.
- **Upload bị 500**: kiểm tra MinIO đang chạy và bucket `documents` / `pending-documents` đã được tạo (sidecar `minio-init` trong docker-compose lo việc này).
- **Login fail "Email hoặc mật khẩu không đúng"** dù vừa register: kiểm tra `passwordHash` trong DB không null.

## Quy ước

- File: `kebab-case.tsx`. Component: `PascalCase`. Function: `camelCase`.
- Server Component mặc định; thêm `'use client'` khi cần interactivity.
- Validate Zod cả client và server.
- URL slug tiếng Việt không dấu (`slugify()` trong `src/lib/utils.ts`).
- Dark mode + accessible focus ring.

## License

MIT.
