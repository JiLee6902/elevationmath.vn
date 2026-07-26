import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// 2 endpoint: internal (app → MinIO trong cùng docker network)
// và public (browser → MinIO qua Caddy reverse proxy)
const INTERNAL_ENDPOINT = process.env.S3_ENDPOINT ?? 'http://minio:9000';
const PUBLIC_ENDPOINT = process.env.S3_PUBLIC_ENDPOINT ?? INTERNAL_ENDPOINT;
const REGION = process.env.S3_REGION ?? 'us-east-1';
const ACCESS_KEY = process.env.S3_ACCESS_KEY ?? '';
const SECRET_KEY = process.env.S3_SECRET_KEY ?? '';

export const BUCKET_APPROVED = 'documents';
export const BUCKET_PENDING = 'pending-documents';
// Bucket công khai (anonymous read) cho ảnh bìa render — để <Image> tải trực tiếp.
export const BUCKET_COVERS = 'covers';

/** URL công khai của ảnh bìa, phục vụ qua Caddy (/storage/* → MinIO). */
export function buildPublicCoverUrl(key: string): string {
  return `/storage/${BUCKET_COVERS}/${key}`;
}

const internalClient = new S3Client({
  endpoint: INTERNAL_ENDPOINT,
  region: REGION,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  forcePathStyle: true, // MinIO bắt buộc path-style
});

const publicClient = new S3Client({
  endpoint: PUBLIC_ENDPOINT,
  region: REGION,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  forcePathStyle: true,
});

export async function uploadFile(
  bucket: string,
  key: string,
  body: Buffer,
  contentType?: string,
): Promise<void> {
  await internalClient.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export function buildStorageUrl(bucket: string, key: string): string {
  // URL "danh nghĩa" — chưa ký, dùng làm fileUrl trong DB.
  // Khi cần download thật sẽ ký lại bằng signDownloadUrl.
  return `s3://${bucket}/${key}`;
}

export function parseStorageUrl(
  url: string,
): { bucket: string; key: string } | null {
  // Hỗ trợ format s3://... và URL cũ (legacy) để migration mượt
  const m1 = url.match(/^s3:\/\/([^/]+)\/(.+)$/);
  if (m1) return { bucket: m1[1], key: m1[2] };
  const m2 = url.match(
    /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+?)(?:\?.*)?$/,
  );
  if (m2) return { bucket: m2[1], key: decodeURIComponent(m2[2]) };
  return null;
}

export async function signDownloadUrl(
  bucket: string,
  key: string,
  expiresInSec = 3600,
): Promise<string> {
  return getSignedUrl(
    publicClient,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: expiresInSec },
  );
}
