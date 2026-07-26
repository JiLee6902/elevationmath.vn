import { BookOpen, GraduationCap, Library } from 'lucide-react';
import type { LevelKey } from '@/lib/constants';

export const LEVEL_VISUALS: Record<
  LevelKey,
  {
    Icon: typeof BookOpen;
    accent: string;
    blob: string;
    ring: string;
    gradient: string;
    eyebrow: string;
  }
> = {
  tieu_hoc: {
    Icon: BookOpen,
    accent: 'text-sky-600 dark:text-sky-400',
    blob: 'bg-sky-500/15',
    ring: 'group-hover:ring-sky-500/30',
    gradient: 'from-sky-500 to-cyan-600',
    eyebrow: 'Cấp 1',
  },
  thcs: {
    Icon: Library,
    accent: 'text-emerald-600 dark:text-emerald-400',
    blob: 'bg-emerald-500/15',
    ring: 'group-hover:ring-emerald-500/30',
    gradient: 'from-emerald-500 to-teal-600',
    eyebrow: 'Cấp 2',
  },
  thpt: {
    Icon: GraduationCap,
    accent: 'text-violet-600 dark:text-violet-400',
    blob: 'bg-violet-500/15',
    ring: 'group-hover:ring-violet-500/30',
    gradient: 'from-violet-500 to-purple-600',
    eyebrow: 'Cấp 3',
  },
};
