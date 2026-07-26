#!/usr/bin/env bash
# Backup Postgres + MinIO của mathverse: giữ bản local + (tuỳ chọn) đẩy offsite qua rclone.
# Chạy bằng cron hằng ngày. Xem hướng dẫn ở DEPLOY.md mục 7.
set -euo pipefail

# --- Config (override qua biến môi trường nếu cần) ---
APP_DIR="${APP_DIR:-/home/deploy/mathverse}"        # nơi chứa docker-compose.yml + .env
BACKUP_DIR="${BACKUP_DIR:-/home/deploy/backups}"    # thư mục lưu backup local
KEEP_DAYS="${KEEP_DAYS:-14}"                         # giữ backup bao nhiêu ngày (local + remote)
RCLONE_REMOTE="${RCLONE_REMOTE:-}"                   # vd: r2:mathverse-backups — RỖNG = chỉ backup local
MINIO_VOLUME="${MINIO_VOLUME:-mathverse_minio_data}" # kiểm tra tên thật: docker volume ls

log() { echo "[$(date +'%F %T')] $*"; }
die() { log "LỖI: $*" >&2; exit 1; }

cd "$APP_DIR" || die "Không vào được $APP_DIR"

# Nạp POSTGRES_USER / POSTGRES_DB từ .env
set -a; [ -f .env ] && . ./.env; set +a
: "${POSTGRES_USER:?thiếu POSTGRES_USER trong .env}"
: "${POSTGRES_DB:?thiếu POSTGRES_DB trong .env}"

STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
DB_FILE="$BACKUP_DIR/db-$STAMP.sql.gz"
MINIO_FILE="$BACKUP_DIR/minio-$STAMP.tar.gz"

# --- 1. Dump Postgres (--clean --if-exists để restore idempotent) ---
log "Dump Postgres → $DB_FILE"
docker compose exec -T postgres \
  pg_dump --clean --if-exists -U "$POSTGRES_USER" "$POSTGRES_DB" \
  | gzip > "$DB_FILE"
[ -s "$DB_FILE" ] || die "Dump Postgres rỗng — kiểm tra container postgres"

# --- 2. Tar volume MinIO (file user upload — tài sản chính) ---
log "Backup MinIO volume '$MINIO_VOLUME' → $MINIO_FILE"
docker run --rm \
  -v "$MINIO_VOLUME":/data:ro \
  -v "$BACKUP_DIR":/backup \
  alpine tar czf "/backup/$(basename "$MINIO_FILE")" -C /data . \
  || die "Backup MinIO thất bại — kiểm tra tên volume ($MINIO_VOLUME)"

# --- 3. Đẩy offsite (nếu cấu hình RCLONE_REMOTE) ---
if [ -n "$RCLONE_REMOTE" ]; then
  command -v rclone >/dev/null || die "chưa cài rclone (apt install rclone)"
  log "Đẩy offsite → $RCLONE_REMOTE"
  rclone copy "$DB_FILE"    "$RCLONE_REMOTE/" --no-traverse
  rclone copy "$MINIO_FILE" "$RCLONE_REMOTE/" --no-traverse
  log "Xoá backup remote cũ hơn ${KEEP_DAYS} ngày"
  rclone delete --min-age "${KEEP_DAYS}d" "$RCLONE_REMOTE/" || true
else
  log "CẢNH BÁO: RCLONE_REMOTE rỗng — CHỈ có backup local. Ổ đĩa hỏng = mất sạch."
fi

# --- 4. Dọn backup local cũ ---
find "$BACKUP_DIR" -name 'db-*.sql.gz'    -mtime +"$KEEP_DAYS" -delete
find "$BACKUP_DIR" -name 'minio-*.tar.gz' -mtime +"$KEEP_DAYS" -delete

log "Xong. Backup local hiện tại:"
du -sh "$BACKUP_DIR"
ls -lh "$DB_FILE" "$MINIO_FILE"
