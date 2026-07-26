import { chromium } from 'playwright';

const OUT = process.env.HOME + '/Desktop/mathverse-image';
const BASE = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@elevationmath.vn';
const ADMIN_PASS = 'ChangeMe123!';

// Logged-out pages
const PUBLIC = [
  ['01-trang-chu', '/'],
  ['02-tieu-hoc', '/tieu-hoc'],
  ['03-tieu-hoc-lop3-canh-dieu', '/tieu-hoc/3/canh_dieu'],
  ['04-thcs', '/thcs'],
  ['05-thcs-lop7-canh-dieu', '/thcs/7/canh_dieu'],
  ['06-thpt', '/thpt'],
  ['07-thpt-lop10-ket-noi-tri-thuc', '/thpt/10/ket_noi_tri_thuc'],
  ['08-tai-lieu-chi-tiet', '/tai-lieu/ly-thuyet-so-huu-ti-toan-7-canh-dieu'],
  ['09-nhom-luyen-thi', '/nhom/luyen-thi'],
  ['10-tim-kiem-co-ket-qua', '/tim-kiem?q=toan'],
  ['11-tim-kiem-trong', '/tim-kiem'],
  ['12-dang-nhap', '/dang-nhap'],
  ['13-dang-ky', '/dang-ky'],
];

// Pages that need an authenticated admin session
const ADMIN = [
  ['14-admin-dashboard', '/admin'],
  ['15-admin-thong-ke', '/admin/thong-ke'],
  ['16-admin-tai-lieu', '/admin/tai-lieu'],
  ['17-admin-tai-lieu-cho-duyet', '/admin/tai-lieu/pending'],
  ['18-admin-tai-lieu-them-moi', '/admin/tai-lieu/new'],
  ['19-admin-tai-lieu-chi-tiet', null], // resolved at runtime
  ['20-admin-chuong-trinh', '/admin/chuong-trinh'],
  ['21-admin-chuong', '/admin/chuong'],
  ['22-admin-nguoi-dung', '/admin/nguoi-dung'],
  ['23-admin-nhom', '/admin/nhom'],
  ['24-admin-cai-dat', '/admin/cai-dat'],
];

const DOC_ID = process.argv[2]; // a document id for admin detail page

async function shoot(page, name, path) {
  const url = BASE + path;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    // give client components + data a moment to settle
    await page.waitForTimeout(2500);
    try { await page.waitForLoadState('networkidle', { timeout: 6000 }); } catch {}
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    console.log(`OK   ${name}  <- ${path}  (${page.url().replace(BASE, '') || '/'})`);
  } catch (e) {
    console.log(`FAIL ${name}  <- ${path}  :: ${e.message.split('\n')[0]}`);
    try { await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true }); } catch {}
  }
}

const browser = await chromium.launch();
// reducedMotion disables the .reveal scroll-driven (animation-timeline: view())
// fade-ins, which would otherwise stay at opacity:0 in a no-scroll full-page capture.
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
});
const page = await ctx.newPage();

console.log('--- public pages ---');
for (const [name, path] of PUBLIC) await shoot(page, name, path);

console.log('--- login as admin ---');
await page.goto(BASE + '/dang-nhap', { waitUntil: 'domcontentloaded' });
await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
await page.fill('input[type="password"], input[name="password"]', ADMIN_PASS);
await Promise.all([
  page.waitForLoadState('networkidle').catch(() => {}),
  page.click('button[type="submit"]'),
]);
await page.waitForTimeout(2000);
console.log('after login url:', page.url());

console.log('--- admin / authenticated pages ---');
for (const [name, path] of ADMIN) {
  const p = path ?? (DOC_ID ? `/admin/tai-lieu/${DOC_ID}` : null);
  if (!p) { console.log(`SKIP ${name} (no doc id)`); continue; }
  await shoot(page, name, p);
}

await browser.close();
console.log('DONE');
