import { spawn } from 'node:child_process';
import { writeFile, readFile, rm, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Render 1 trang PDF → ảnh PNG bằng poppler (pdftoppm).
 * Server-only (cần binary `pdftoppm`). Dùng cho seed + pipeline upload.
 *
 * @param pdf   Buffer nội dung PDF
 * @param page  số trang (1-based)
 * @param width chiều rộng ảnh (px), cao tự co theo tỉ lệ
 */
/** Đếm số trang PDF bằng pdfinfo (poppler). Lỗi → null. */
export async function getPdfPageCount(pdf: Buffer): Promise<number | null> {
  const dir = await mkdtemp(join(tmpdir(), 'mv-info-'));
  const inPath = join(dir, 'in.pdf');
  try {
    await writeFile(inPath, pdf);
    const out = await new Promise<string>((resolve, reject) => {
      const proc = spawn('pdfinfo', [inPath]);
      let buf = '';
      let err = '';
      proc.stdout.on('data', (d) => (buf += d));
      proc.stderr.on('data', (d) => (err += d));
      proc.on('error', reject);
      proc.on('close', (code) =>
        code === 0 ? resolve(buf) : reject(new Error(err)),
      );
    });
    const m = out.match(/^Pages:\s+(\d+)/m);
    return m ? Number(m[1]) : null;
  } catch {
    return null;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export async function renderPdfPage(
  pdf: Buffer,
  page = 1,
  width = 600,
): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), 'mv-cover-'));
  const inPath = join(dir, 'in.pdf');
  const outPrefix = join(dir, 'out');
  try {
    await writeFile(inPath, pdf);
    await new Promise<void>((resolve, reject) => {
      const proc = spawn('pdftoppm', [
        '-png',
        '-singlefile',
        '-f',
        String(page),
        '-l',
        String(page),
        '-scale-to-x',
        String(width),
        '-scale-to-y',
        '-1',
        inPath,
        outPrefix,
      ]);
      let err = '';
      proc.stderr.on('data', (d) => (err += d));
      proc.on('error', reject);
      proc.on('close', (code) =>
        code === 0
          ? resolve()
          : reject(new Error(`pdftoppm exit ${code}: ${err}`)),
      );
    });
    return await readFile(`${outPrefix}.png`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
