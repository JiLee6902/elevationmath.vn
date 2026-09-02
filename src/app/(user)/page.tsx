import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  ChevronDown,
  Flame,
  GraduationCap,
  Heart,
  Infinity as InfinityIcon,
  Sparkles,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LEVELS, type LevelKey } from '@/lib/constants';
import type { Document, DocumentType, ProgramGroup } from '@/lib/db/schema';
import { DocCarousel } from '@/components/user/doc-carousel';
import { CoursesSection } from '@/components/user/courses-section';
import { SearchForm } from '@/components/user/search-form';
import { LEVEL_VISUALS } from '@/components/user/level-visuals';
import {
  getDocuments,
  getFeaturedDocuments,
  getProgramGroups,
  getRecentDocuments,
} from '@/lib/db/queries';
import { cn, groupGradient } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [groups, heroDocs] = await Promise.all([
    getProgramGroups().catch(() => []),
    getFeaturedDocuments(5).catch(() => []),
  ]);

  return (
    <div className="pb-16">
      {/* Hero — gọn, lấy search làm trung tâm */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/[0.05] to-transparent">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `linear-gradient(to right, color-mix(in oklch, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 5%, transparent) 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
            maskImage:
              'radial-gradient(70% 90% at 50% 0%, black 20%, transparent 85%)',
          }}
        />
        <div className="container mx-auto px-4 py-14 text-center md:py-20">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            Kho tài liệu toán cho{' '}
            <span className="text-primary">mọi học sinh Việt Nam</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            Lý thuyết, bài tập, đề thi từ lớp 1 đến lớp 12 — đọc trực tiếp,
            tải miễn phí.
          </p>

          {/* Thanh tìm kiếm nổi bật — form GET thật */}
          <SearchForm className="mx-auto mt-8 max-w-xl" />

          {/* Chip nhanh — nhóm chương trình từ DB */}
          {groups.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {groups.map((g) => (
                <Link
                  key={g.id}
                  href={`/nhom/${g.slug}`}
                  className="rounded-full border bg-card/60 px-3.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          )}

          {/* Cụm bìa xếp xòe — điểm nhấn hero */}
          <HeroPreview docs={heroDocs} />
        </div>
      </section>

      {/* Duyệt theo nhóm chương trình (động từ DB) */}
      {groups.length > 0 && (
        <section className="reveal container mx-auto px-4 pt-12">
          <SectionHeader
            eyebrow="Nhóm chương trình"
            icon={<Sparkles className="size-3.5" />}
            title="Chọn theo mục tiêu của bạn"
          />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {groups.map((g) => (
              <Link
                key={g.id}
                href={`/nhom/${g.slug}`}
                className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <div
                  className="flex size-11 items-center justify-center rounded-xl text-white shadow-sm"
                  style={{ background: groupGradient(g.color) }}
                >
                  <BookOpen className="size-5" />
                </div>
                <h3 className="mt-4 font-semibold leading-snug">{g.name}</h3>
                {g.description && (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {g.description}
                  </p>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Xem tài liệu
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tài liệu nổi bật */}
      <div className="container mx-auto px-4 pt-14">
        <Suspense fallback={<CarouselSkeleton />}>
          <TopDocsCarousel />
        </Suspense>
      </div>

      {/* Duyệt theo cấp lớp */}
      <section className="container mx-auto px-4 pt-14">
        <SectionHeader
          eyebrow="Cấp học"
          icon={<GraduationCap className="size-3.5" />}
          title="Theo cấp lớp"
        />
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {(Object.keys(LEVELS) as LevelKey[]).map((lvl) => {
            const v = LEVEL_VISUALS[lvl];
            const grades = LEVELS[lvl].grades;
            return (
              <Link
                key={lvl}
                href={`/${LEVELS[lvl].slug}`}
                className="group flex items-center gap-4 rounded-xl border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <div
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-2xl',
                    v.blob,
                    v.accent,
                  )}
                >
                  <v.Icon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold tracking-tight">
                    {LEVELS[lvl].name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Lớp {grades[0]}–{grades[grades.length - 1]} · Tài liệu theo mục tiêu học tập
                  </p>
                </div>
                <ArrowRight className="size-5 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Mới cập nhật */}
      <div className="reveal container mx-auto px-4 pt-14">
        <Suspense fallback={<CarouselSkeleton />}>
          <RecentDocsCarousel />
        </Suspense>
      </div>

      {/* Đề thi & kiểm tra hot */}
      <div className="reveal container mx-auto px-4 pt-14">
        <Suspense fallback={<CarouselSkeleton />}>
          <ExamCarousel />
        </Suspense>
      </div>

      {/* Mỗi nhóm chương trình 1 hàng (kho "giàu" như trang lớn) */}
      {groups.map((g) => (
        <div key={g.id} className="reveal container mx-auto px-4 pt-14">
          <Suspense fallback={<CarouselSkeleton />}>
            <GroupCarousel group={g} />
          </Suspense>
        </div>
      ))}

      {/* Các khóa học (Online & Offline) */}
      <CoursesSection />

      {/* Vì sao Elevation Math */}
      <section className="reveal border-y bg-muted/40">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow className="mb-3">Vì sao Elevation Math</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Học toán giỏi cùng{' '}
              <span className="text-primary">Elevation Math</span>
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Một nơi tập trung tài liệu chất lượng do giáo viên và học sinh
              đóng góp, miễn phí trọn đời.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={Heart}
              tone="rose"
              title="Miễn phí 100%"
              metric="0đ"
              metricLabel="phí ẩn"
              description="Không quảng cáo phiền toái, không gói premium. Dành cho mọi học sinh."
            />
            <Feature
              icon={BookMarked}
              tone="emerald"
              title="Học đúng mục tiêu"
              metric="4 nhóm"
              metricLabel="học tập"
              description="Lấy gốc, phát triển, nâng cao và luyện thi — chọn đúng nhu cầu của bạn."
            />
            <Feature
              icon={Users}
              tone="violet"
              title="Cộng đồng học tập"
              metric="50K+"
              metricLabel="lượt học / tháng"
              description="Hàng nghìn học sinh và giáo viên dùng Elevation Math mỗi ngày."
            />
            <Feature
              icon={InfinityIcon}
              tone="amber"
              title="Không giới hạn"
              metric="∞"
              metricLabel="lượt tải"
              description="Học mọi lúc mọi nơi — không cần đăng ký, không phải đợi."
            />
          </div>
        </div>
      </section>

      {/* Cách hoạt động */}
      <section className="reveal container mx-auto px-4 py-16 md:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Eyebrow className="mb-3">Cách hoạt động</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Bắt đầu chỉ trong 3 bước
          </h2>
          <p className="mt-4 text-muted-foreground">
            Đơn giản như mở quyển sách giáo khoa.
          </p>
        </div>
        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
          <Step
            n="01"
            title="Chọn lớp & mục tiêu"
            description="Tìm theo cấp học, lớp hoặc nhóm chương trình. Không cần đăng ký."
          />
          <Step
            n="02"
            title="Đọc tài liệu"
            description="Xem trực tiếp PDF trong trình duyệt hoặc tải về máy."
          />
          <Step
            n="03"
            title="Học & chia sẻ"
            description="Học theo chương, đánh giá, và đóng góp tài liệu của riêng bạn."
            isLast
          />
        </div>
      </section>

      {/* Đánh giá */}
      <section className="reveal border-y bg-muted/40">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Eyebrow className="mb-3">Cộng đồng nói gì</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Học sinh và giáo viên đã yêu thích
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Testimonial
              quote="Tài liệu theo đúng mục tiêu luyện thi, mình ôn vào 10 chỉ với Elevation Math. Đề kiểm tra rất sát thực tế."
              name="Minh Anh"
              role="Học sinh lớp 9 · Hà Nội"
              initial="M"
              tint="bg-sky-500/15 text-sky-600 dark:text-sky-400"
            />
            <Testimonial
              quote="Mình là giáo viên dạy thêm, Elevation Math giúp tiết kiệm cả buổi soạn bài. Có cả file PDF lẫn lời giải."
              name="Cô Thu Hương"
              role="Giáo viên · TP.HCM"
              initial="H"
              tint="bg-rose-500/15 text-rose-600 dark:text-rose-400"
            />
            <Testimonial
              quote="Là phụ huynh, mình yên tâm vì tài liệu được kiểm duyệt và miễn phí hoàn toàn. Con học hứng thú hơn hẳn."
              name="Anh Tuấn"
              role="Phụ huynh · Đà Nẵng"
              initial="T"
              tint="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="reveal container mx-auto max-w-3xl px-4 py-16 md:py-20">
        <div className="mb-10 text-center">
          <Eyebrow className="mb-3">Câu hỏi thường gặp</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Giải đáp nhanh
          </h2>
        </div>
        <div className="space-y-3">
          <Faq
            q="Elevation Math có thực sự miễn phí không?"
            a="Có. 100% miễn phí, không có phí ẩn, không gói premium. Dự án phi lợi nhuận, sống nhờ cộng đồng và quyên góp tự nguyện."
          />
          <Faq
            q="Tài liệu có chất lượng không?"
            a="Mọi tài liệu đều được kiểm duyệt trước khi hiển thị công khai. Cộng đồng có thể đánh giá để tài liệu tốt nhất nổi lên."
          />
          <Faq
            q="Tôi có cần đăng ký để xem tài liệu không?"
            a="Không. Mọi tài liệu đều xem và tải tự do, không cần đăng ký tài khoản."
          />
          <Faq
            q="Tài liệu có được cập nhật thường xuyên không?"
            a="Có. Đội ngũ biên tập liên tục bổ sung lý thuyết, bài tập và đề thi mới, đặc biệt vào mùa thi."
          />
          <Faq
            q="Elevation Math có những nhóm tài liệu nào?"
            a="Bạn có thể chọn Lấy gốc, Phát triển, Nâng cao hoặc Luyện thi, đầy đủ từ lớp 1 đến lớp 12."
          />
        </div>
      </section>

      {/* CTA học tập — card sáng, tinh tế */}
      <section className="reveal container mx-auto px-4 pt-16">
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-b from-primary/[0.07] via-card to-card px-6 py-14 text-center md:py-16">
          {/* lưới graph mờ */}
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, color-mix(in oklch, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 5%, transparent) 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
              maskImage: 'radial-gradient(60% 80% at 50% 0%, black, transparent 80%)',
            }}
          />
          <div className="relative mx-auto max-w-xl">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <GraduationCap className="size-6" />
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-3xl">
              Bắt đầu học toán ngay hôm nay
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Hàng nghìn tài liệu, đề thi và chuyên đề miễn phí — chọn lớp hoặc
              tìm kiếm để bắt đầu.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/tim-kiem">
                <Button size="lg" className="h-12 px-7 text-base">
                  Tìm tài liệu
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/thpt">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base"
                >
                  <GraduationCap className="size-4" />
                  Khám phá theo lớp
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  icon,
  title,
  subtitle,
}: {
  eyebrow?: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      {eyebrow && (
        <div className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          {icon}
          {eyebrow}
        </div>
      )}
      <h2 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

function CarouselSkeleton() {
  return (
    <div>
      <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
      <div className="no-scrollbar mt-4 flex gap-4 overflow-hidden pb-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-[78%] shrink-0 sm:w-[46%] md:w-[31%] lg:w-[22%] xl:w-[21.5%]"
          >
            <div className="aspect-[3/4] w-full animate-pulse rounded-lg bg-muted" />
            <div className="mt-2.5 h-4 w-full animate-pulse rounded bg-muted" />
            <div className="mt-1.5 h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function TopDocsCarousel() {
  const docs = await getFeaturedDocuments(12).catch(() => []);
  return (
    <DocCarousel
      title="Tài liệu nổi bật"
      eyebrow="Phổ biến"
      icon={<Flame className="size-3.5" />}
      docs={docs}
      href="/thcs/lop-7"
    />
  );
}

async function RecentDocsCarousel() {
  const docs = await getRecentDocuments(12).catch(() => []);
  return (
    <DocCarousel
      title="Mới cập nhật"
      eyebrow="Mới nhất"
      icon={<Sparkles className="size-3.5" />}
      docs={docs}
      href="/thpt/lop-12"
    />
  );
}

async function ExamCarousel() {
  const res = await getDocuments({
    search: 'Đề thi',
    status: 'approved',
    sort: 'popular',
    limit: 12,
  }).catch(() => ({ data: [], total: 0, page: 1, limit: 12, totalPages: 0 }));
  return (
    <DocCarousel
      title="Đề thi & kiểm tra"
      eyebrow="Ôn luyện"
      icon={<GraduationCap className="size-3.5" />}
      docs={res.data}
      href="/tim-kiem?q=đề thi"
    />
  );
}

async function GroupCarousel({ group }: { group: ProgramGroup }) {
  const res = await getDocuments({
    programGroupId: group.id,
    status: 'approved',
    sort: 'popular',
    limit: 12,
  }).catch(() => ({ data: [], total: 0, page: 1, limit: 12, totalPages: 0 }));
  return (
    <DocCarousel
      title={group.name}
      eyebrow="Nhóm chương trình"
      icon={<BookOpen className="size-3.5" />}
      docs={res.data}
      href={`/nhom/${group.slug}`}
    />
  );
}

/** Cụm bìa xếp xòe ở hero — điểm nhấn thị giác (desktop). */
function HeroPreview({
  docs,
}: {
  docs: Array<Document & { documentType?: DocumentType | null }>;
}) {
  if (docs.length < 3) return null;
  const items = docs.slice(0, 5);
  const rot = ['-rotate-[8deg]', '-rotate-3', 'rotate-0', 'rotate-3', 'rotate-[8deg]'];
  const lift = ['translate-y-5', 'translate-y-1', '-translate-y-3', 'translate-y-1', 'translate-y-5'];
  return (
    <div className="mt-14 hidden items-end justify-center md:flex">
      {items.map((d, i) => (
        <div
          key={d.id}
          className={cn(
            'relative -mx-3 w-28 transition-all duration-300 hover:z-20 hover:-translate-y-4',
            rot[i],
            lift[i],
            i === 2 && 'z-10 w-32',
          )}
        >
          <MiniCover doc={d} />
        </div>
      ))}
    </div>
  );
}

function MiniCover({
  doc,
}: {
  doc: Document & { documentType?: DocumentType | null };
}) {
  const glyph = '∑';
  return (
    <Link href={`/tai-lieu/${doc.slug}`} className="block">
      <div
        className={cn(
          'relative aspect-[3/4] overflow-hidden rounded-xl border border-white/25 bg-gradient-to-br shadow-2xl',
          'from-primary to-sky-600',
        )}
      >
        {doc.thumbnailUrl ? (
          <Image
            src={doc.thumbnailUrl}
            alt={doc.title}
            fill
            sizes="128px"
            className="object-cover object-top"
          />
        ) : (
          <>
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.25) 1px, transparent 0)',
                backgroundSize: '11px 11px',
                maskImage: 'linear-gradient(140deg, black, transparent 80%)',
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-6 -right-2 select-none font-display text-7xl leading-none text-white/20"
            >
              {glyph}
            </span>
            <div className="relative p-2.5">
              <span className="font-display text-base font-bold text-white/95">
                L{doc.grade}
              </span>
              <p className="mt-1 line-clamp-3 text-[10px] font-semibold leading-snug text-white drop-shadow">
                {doc.title}
              </p>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}

function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary',
        className,
      )}
    >
      <span className="h-px w-6 bg-primary/40" aria-hidden />
      {children}
    </div>
  );
}

type FeatureTone = 'rose' | 'emerald' | 'violet' | 'amber';
const FEATURE_TONE: Record<FeatureTone, { tint: string; metric: string }> = {
  rose: {
    tint: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    metric: 'text-rose-600 dark:text-rose-400',
  },
  emerald: {
    tint: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    metric: 'text-emerald-600 dark:text-emerald-400',
  },
  violet: {
    tint: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    metric: 'text-violet-600 dark:text-violet-400',
  },
  amber: {
    tint: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    metric: 'text-amber-700 dark:text-amber-400',
  },
};

function Feature({
  icon: Icon,
  tone,
  title,
  metric,
  metricLabel,
  description,
}: {
  icon: typeof Heart;
  tone: FeatureTone;
  title: string;
  metric: string;
  metricLabel: string;
  description: string;
}) {
  const t = FEATURE_TONE[tone];
  return (
    <div className="h-full rounded-xl border bg-card p-6">
      <div
        className={cn(
          'mb-5 flex size-11 items-center justify-center rounded-xl',
          t.tint,
        )}
      >
        <Icon className="size-5" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-5 border-t border-border/60 pt-5">
        <div
          className={cn(
            'text-3xl font-semibold leading-none tracking-tight',
            t.metric,
          )}
        >
          {metric}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">{metricLabel}</div>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  description,
  isLast,
}: {
  n: string;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className="relative">
      <div className="h-full rounded-xl border bg-card p-7">
        <div className="font-display text-5xl leading-none text-primary/30">
          {n}
        </div>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {!isLast && (
        <div
          aria-hidden
          className="absolute top-1/2 -right-3 z-10 hidden size-7 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border-2 bg-card text-muted-foreground shadow-sm md:flex"
        >
          <ArrowRight className="size-3.5" />
        </div>
      )}
    </div>
  );
}

function Testimonial({
  quote,
  name,
  role,
  initial,
  tint,
}: {
  quote: string;
  name: string;
  role: string;
  initial: string;
  tint: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-6">
      <div className="mb-4 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="size-3.5 text-amber-400"
            style={{
              clipPath:
                'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              background: 'currentColor',
              display: 'inline-block',
            }}
          />
        ))}
      </div>
      <p className="flex-1 leading-relaxed text-foreground/90">“{quote}”</p>
      <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-full font-semibold uppercase',
            tint,
          )}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{name}</div>
          <div className="truncate text-xs text-muted-foreground">{role}</div>
        </div>
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:border-border open:border-primary/25 open:shadow-sm">
      <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-4 p-5 md:p-6">
        <span className="text-base font-medium transition-colors group-open:text-primary">
          {q}
        </span>
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition-all duration-300 group-open:rotate-180 group-open:border-primary group-open:bg-primary group-open:text-primary-foreground"
        >
          <ChevronDown className="size-4" />
        </span>
      </summary>
      <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground md:px-6 md:pb-6">
        {a}
      </div>
    </details>
  );
}
