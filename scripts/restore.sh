#!/usr/bin/env bash
# Restore Postgres + (tuỳ chọn) MinIO từ file backup do backup.sh tạo.
# CẢNH BÁO: GHI ĐÈ dữ liệu hiện tại. Dùng khi khôi phục sau sự cố hoặc dựng lại server mới.
#
# Dùng:
#   ./scripts/restore.sh db-20260530-030000.sql.gz [minio-20260530-030000.tar.gz]
#
# Nếu file backup nằm trên R2: tải về trước bằng
#   rclone copy r2:mathverse-backups/db-XXXX.sql.gz .
set -euo pipefail

APP_DIR="${APP_DIR:-/home/deploy/mathverse}"
MINIO_VOLUME="${MINIO_VOLUME:-mathverse_minio_data}"

cd "$APP_DIR" || { echo "Không vào được $APP_DIR"; exit 1; }
set -a; [ -f .env ] && . ./.env; set +a
: "${POSTGRES_USER:?thiếu POSTGRES_USER}"
: "${POSTGRES_DB:?thiếu POSTGRES_DB}"

DB_FILE="${1:-}"
MINIO_FILE="${2:-}"
[ -z "$DB_FILE" ] && { echo "Dùng: $0 <db-*.sql.gz> [minio-*.tar.gz]"; exit 1; }
[ -f "$DB_FILE" ] || { echo "Không thấy file: $DB_FILE"; exit 1; }

echo "!!! Sắp GHI ĐÈ database '$POSTGRES_DB'${MINIO_FILE:+ và volume '$MINIO_VOLUME'}."
printf "Gõ 'yes' để tiếp tục: "; read -r ok
[ "$ok" = "yes" ] || { echo "Huỷ."; exit 1; }

# --- Restore Postgres ---
echo "Restore Postgres từ $DB_FILE"
gunzip -c "$DB_FILE" | docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

# --- Restore MinIO (nếu có) ---
if [ -n "$MINIO_FILE" ]; then
  [ -f "$MINIO_FILE" ] || { echo "Không thấy file: $MINIO_FILE"; exit 1; }
  echo "Restore MinIO từ $MINIO_FILE (xoá nội dung volume cũ trước)"
  docker compose stop minio
  docker run --rm \
    -v "$MINIO_VOLUME":/data \
    -v "$(cd "$(dirname "$MINIO_FILE")" && pwd)":/backup \
    alpine sh -c "rm -rf /data/* /data/..?* /data/.[!.]* 2>/dev/null; tar xzf /backup/$(basename "$MINIO_FILE") -C /data"
  docker compose start minio
fi

echo "Xong. Kiểm tra app: docker compose logs -f app"
