import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { LEVELS, type LevelKey } from '@/lib/constants';
import { getDocCountsByGrade } from '@/lib/db/queries';
import { cn, formatNumber } from '@/lib/utils';
import { Breadcrumb } from './breadcrumb';
import { LEVEL_VISUALS } from './level-visuals';

export async function LevelPage({ level }: { level: LevelKey }) {
  const config = LEVELS[level];
  const v = LEVEL_VISUALS[level];
  const counts = await getDocCountsByGrade(level).catch(
    () => ({}) as Record<number, number>,
  );
  const totalDocs = Object.values(counts).reduce((s, n) => s + n, 0);
  const activeGrades = config.grades.filter((grade) => (counts[grade] ?? 0) > 0)
    .length;

  return (
    <div>
      <section className="relative overflow-hidden border-b bg-card">
        {/* glow màu theo cấp */}
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -right-10 -top-24 size-80 rounded-full bg-gradient-to-br opacity-20 blur-3xl',
            v.gradient,
          )}
        />
        {/* lưới graph mờ */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, color-mix(in oklch, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 5%, transparent) 1px, transparent 1px)`,
            backgroundSize: '34px 34px',
            maskImage: 'radial-gradient(70% 90% at 30% 0%, black, transparent 80%)',
          }}
        />
        <div className="container relative mx-auto px-4 py-10 md:py-12">
          <Breadcrumb
            items={[{ label: 'Trang chủ', href: '/' }, { label: config.name }]}
          />
          <div className="mt-5 grid items-end gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
            <div className="flex min-w-0 items-start gap-4">
              <span
                className={cn(
                  'flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-primary/15 ring-1 ring-black/5',
                  v.gradient,
                )}
              >
                <v.Icon className="size-7" />
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    'text-[11px] font-semibold uppercase tracking-[0.16em]',
                    v.accent,
                  )}
                >
                  {v.eyebrow}
                </p>
                <h1 className="mt-1 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
                  Toán {config.name}
                </h1>
                <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
                  Chọn lớp để khám phá tài liệu, phiếu học tập và các chuyên đề
                  phù hợp với lộ trình của bạn.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl border bg-background/70 p-2 shadow-sm backdrop-blur-sm">
              <div className="rounded-xl bg-muted/70 px-3 py-2.5">
                <p className="text-lg font-bold tracking-tight">{formatNumber(totalDocs)}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Tài liệu</p>
              </div>
              <div className="rounded-xl bg-muted/70 px-3 py-2.5">
                <p className="text-lg font-bold tracking-tight">{activeGrades}/{config.grades.length}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Lớp sẵn sàng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        {/* Grades */}
        <section className="mt-10 rounded-3xl border bg-card/70 p-5 shadow-sm md:mt-12 md:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                <v.Icon className="size-3.5" />
                Theo lớp
              </div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Hôm nay bạn học lớp nào?
              </h2>
            </div>
            <p className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              Chọn một lớp để bắt đầu
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {config.grades.map((g) => {
              const c = counts[g] ?? 0;
              return (
                <Link
                  key={g}
                  href={`/${config.slug}/lop-${g}`}
                  className="group focus:outline-none"
                >
                  <Card className="lift-on-hover relative h-full overflow-hidden rounded-2xl border-border/80 p-0 group-hover:border-primary/35 group-hover:shadow-lg group-hover:shadow-primary/10 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                    <span
                      aria-hidden
                      className={cn(
                        'absolute -right-5 -top-5 size-20 rounded-full opacity-70 transition-transform duration-300 group-hover:scale-150',
                        v.blob,
                      )}
                    />
                    <div className="relative p-4 md:p-5">
                      <div
                        className={cn(
                          'flex size-11 items-center justify-center rounded-xl font-display text-2xl font-bold transition-transform group-hover:scale-105',
                          v.blob,
                          v.accent,
                        )}
                      >
                        {g}
                      </div>
                      <div className="mt-4 font-semibold tracking-tight">
                        Lớp {g}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {c > 0 ? `${formatNumber(c)} tài liệu` : 'Sắp có'}
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Khám phá <span aria-hidden>→</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
