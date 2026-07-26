# Deploy mathverse lên Hetzner (Singapore)

Stack: Next.js 16 (standalone) + Postgres 16 + MinIO (storage) + Caddy (auto SSL), tất cả self-host trong Docker Compose. Không phụ thuộc dịch vụ ngoài (trừ domain + Let's Encrypt).

## 1. Tạo VPS Hetzner

1. Đăng ký <https://www.hetzner.com/cloud>, verify thẻ.
2. Create Project → **Add Server**:
   - Location: **Singapore**
   - Image: **Ubuntu 24.04**
   - Type: **CX22** (2 vCPU, 4GB RAM, ~€4.5/tháng) — đủ chạy app + DB nhỏ
   - SSH key: add public key của bạn (`~/.ssh/id_ed25519.pub`)
   - Name: `mathverse-prod`
3. Ghi lại IPv4 của server.

## 2. Trỏ DNS

Tại DNS provider của domain, tạo record:

```
A    @          <IP server>
A    www        <IP server>
```

TTL 300. Đợi ~5 phút cho DNS propagate (kiểm tra: `dig +short your-domain.com`).

## 3. Setup server lần đầu

SSH vào server:

```bash
ssh root@<IP>
```

Cài Docker + tạo user thường + clone code:

```bash
# Cài Docker
curl -fsSL https://get.docker.com | sh

# Tạo user không root để chạy app
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Firewall — chỉ mở 22, 80, 443
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

# (khuyến nghị) tắt SSH password login
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh
```

Logout, login lại bằng user `deploy`:

```bash
ssh deploy@<IP>
git clone <repo-url> mathverse
cd mathverse
cp .env.production.example .env
nano .env   # điền giá trị thật, lưu ý đổi POSTGRES_PASSWORD
```

## 4. Build & start

```bash
docker compose up -d --build
docker compose logs -f app
```

Lần đầu khởi động:
- `minio-init` tự tạo 3 bucket `documents` + `pending-documents` + `covers` (công khai cho ảnh bìa) rồi exit.
- Caddy mất ~30s xin cert Let's Encrypt.

Sau đó vào `https://your-domain.com` xem.

> Stack đã gồm sẵn: **poppler** (render ảnh bìa PDF — cài trong Dockerfile, không cần thao tác thêm), MinIO (lưu file + bucket `covers` công khai), Postgres.

## 5. Tạo schema + seed admin

Dùng `db:push` để đồng bộ **toàn bộ** schema vào DB trống (gồm `program_groups`, `is_featured`, `sessions`…). Lệnh chạy trong container có TTY nên xác nhận được:

```bash
docker compose exec app npx drizzle-kit push
docker compose exec app npx tsx src/lib/db/seed.ts
```

> Vì sao `push` thay vì `migrate`: lịch sử migration `0000` cũ thiếu vài bảng (drift), `push` so trực tiếp schema hiện tại → tạo đủ, an toàn cho DB mới. Các migration `0001`/`0002` là idempotent additive, vẫn chạy được nếu cần.

Sau seed: login bằng `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `.env`.

> **Lưu ý sản phẩm:** đóng góp phía người dùng đã **tắt** — chỉ admin thêm tài liệu (qua `/admin/tai-lieu/new`); khi upload PDF, hệ thống tự render ảnh bìa (poppler) lưu vào bucket `covers`. Admin chọn tài liệu nổi bật lên trang chủ bằng nút ⭐ ở `/admin/tai-lieu`.

### MinIO Console (admin xem bucket)

Console MinIO chạy ở port 9001 nội bộ. Nếu cần xem, dựng SSH tunnel từ máy local:

```bash
ssh -L 9001:localhost:9001 deploy@<IP>
# rồi mở http://localhost:9001 — login bằng MINIO_ROOT_USER / MINIO_ROOT_PASSWORD
```

Không expose port 9001 ra public.

## 6. Update code mới

```bash
git pull
docker compose up -d --build
```

## 7. Backup Postgres + MinIO

Dùng `scripts/backup.sh` (dump Postgres + tar volume MinIO + tự dọn bản cũ). Backup phải có **bản offsite** — nếu chỉ lưu trên chính server thì ổ đĩa hỏng là mất cả data lẫn backup.

### 7.1. Setup offsite Cloudflare R2 (rẻ nhất — 10GB free, egress $0)

1. Cloudflare dashboard → **R2** → Create bucket: `mathverse-backups`.
2. R2 → **Manage API Tokens** → tạo token (Object Read & Write) → ghi lại Access Key + Secret + Account ID.
3. Trên server cài + cấu hình rclone:

```bash
sudo apt install -y rclone
rclone config
# n) new remote → name: r2
# Storage: s3  → Provider: Cloudflare
# access_key_id / secret_access_key: dán key R2
# endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
# region: auto  → còn lại để mặc định
```

Kiểm tra: `rclone lsd r2:mathverse-backups` (không lỗi là ok).

> Đổi nhà cung cấp (Backblaze B2 / Hetzner Storage Box) chỉ cần tạo remote rclone khác rồi đổi `RCLONE_REMOTE` — không sửa script.

### 7.2. Kiểm tra tên volume MinIO

```bash
docker volume ls | grep minio   # thường là mathverse_minio_data
```

Nếu khác `mathverse_minio_data`, truyền qua biến `MINIO_VOLUME` ở cron bên dưới.

### 7.3. Chạy thử + cron hằng ngày 3h sáng

```bash
mkdir -p /home/deploy/backups
# chạy thử 1 lần (đẩy luôn lên R2)
RCLONE_REMOTE=r2:mathverse-backups /home/deploy/mathverse/scripts/backup.sh
```

Nếu chạy ổn → thêm cron (`crontab -e`, user `deploy`):

```cron
0 3 * * * RCLONE_REMOTE=r2:mathverse-backups /home/deploy/mathverse/scripts/backup.sh >> /home/deploy/backups/backup.log 2>&1
```

Bỏ `RCLONE_REMOTE=...` nếu (tạm thời) chỉ muốn backup local.

### 7.4. Restore khi cần (dựng lại server / khôi phục sự cố)

```bash
# nếu file ở R2, tải về trước:
rclone copy r2:mathverse-backups/db-20260530-030000.sql.gz .
rclone copy r2:mathverse-backups/minio-20260530-030000.tar.gz .

# restore (sẽ hỏi xác nhận trước khi ghi đè):
./scripts/restore.sh db-20260530-030000.sql.gz minio-20260530-030000.tar.gz
```

> Nên test restore thử 1 lần lên server tạm để chắc backup dùng được — backup chưa từng restore = backup không đáng tin.

## 8. Lệnh debug hay dùng

| Việc | Lệnh |
|---|---|
| Xem log app | `docker compose logs -f app` |
| Xem log Caddy (debug SSL) | `docker compose logs -f caddy` |
| Restart app | `docker compose restart app` |
| Vào shell container | `docker compose exec app sh` |
| Vào psql | `docker compose exec postgres psql -U $POSTGRES_USER $POSTGRES_DB` |
| Xem bucket MinIO | `docker compose exec minio mc ls local/` |
| Reset bucket (XOÁ file) | `docker compose exec minio mc rm --recursive --force local/pending-documents` |
| Disk usage | `docker system df` |

## 9. Bàn giao cho khách

Trước khi bàn giao:

1. Đổi tất cả password/secret trong `.env` về giá trị "production thật"
2. Tạo backup full: `docker compose exec -T postgres pg_dumpall -U $POSTGRES_USER | gzip > handover.sql.gz`
3. Hetzner → Server → **Transfer to another project/account** → nhập email khách
4. Khách reset SSH key (xoá key của bạn), đổi password DB

## Chi phí ước tính

| Mục | /tháng |
|---|---|
| Hetzner CX22 Singapore | ~€4.5 (~120k VND) |
| Domain | ~$10/năm (~20k/tháng) |
| **Total** | **~140k VND/tháng** |

Không có dịch vụ external nào tốn phí. Toàn bộ Postgres + MinIO + Auth chạy trong server.

Khi traffic tăng (>4GB RAM cần thiết) → nâng cấp lên CX32 (€7/tháng) hoặc CX42.
