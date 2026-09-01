import {
  Award,
  BookOpen,
  ClipboardCheck,
  Crown,
  Globe,
  GraduationCap,
  Phone,
  School,
  ScrollText,
  Sprout,
  TrendingUp,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';

type Course = { icon: LucideIcon; label: string };

const COURSE_GROUPS: { title: string; hint: string; items: Course[] }[] = [
  {
    title: 'Lớp học & kèm riêng',
    hint: 'Lộ trình cá nhân hoá theo trình độ',
    items: [
      { icon: Sprout, label: 'Khóa lấy gốc Toán' },
      { icon: User, label: 'Học kèm 1–1' },
      { icon: Users, label: 'Học kèm nhóm 1–4' },
      { icon: TrendingUp, label: 'Toán trọng tâm & phát triển' },
      { icon: Award, label: 'Bồi dưỡng nâng cao' },
      { icon: Globe, label: 'Toán Cambridge' },
    ],
  },
  {
    title: 'Luyện thi chuyển cấp & học thuật',
    hint: 'Bám sát cấu trúc đề, cam kết đầu ra',
    items: [
      { icon: GraduationCap, label: 'Luyện thi vào 10' },
      { icon: ScrollText, label: 'Luyện thi THPT Quốc Gia' },
      { icon: School, label: 'Vào lớp 6 CLC – Chuyên' },
      { icon: Crown, label: 'Vào lớp 10 Chuyên Toán' },
      { icon: BookOpen, label: 'Luyện thi SAT' },
      { icon: ClipboardCheck, label: 'Luyện thi ĐGNL' },
      { icon: Trophy, label: 'Luyện thi HSG các cấp' },
    ],
  },
];

export function CoursesSection() {
  return (
    <section className="reveal mt-16 border-y bg-muted/40">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Khóa học Elevation Math
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Các khóa học · Hiệu quả đầu ra
          </h2>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-1.5 text-sm font-medium text-foreground/80">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Online &amp; Offline · Từ lớp 3 đến lớp 12
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {COURSE_GROUPS.map((group) => (
            <div
              key={group.title}
              className="rounded-3xl border bg-card p-6 shadow-sm md:p-7"
            >
              <div className="mb-4">
                <p className="text-lg font-semibold">{group.title}</p>
                <p className="text-sm text-muted-foreground">{group.hint}</p>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {group.items.map((course) => (
                  <div
                    key={course.label}
                    className="group flex items-center gap-3 rounded-xl border bg-background/60 px-3.5 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary/[0.04]"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <course.icon className="size-4" />
                    </span>
                    <span className="text-sm font-medium leading-tight">
                      {course.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href="tel:0971321032"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
          >
            <Phone className="size-4" />
            Nhận tư vấn lộ trình
          </a>
          <p className="text-sm text-muted-foreground">
            Hotline 0971 321 032 · 0988 383 732
          </p>
        </div>
      </div>
    </section>
  );
}
