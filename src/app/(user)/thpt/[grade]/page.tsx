import { GradePage } from '@/components/user/grade-page';

export default async function Page({ params, searchParams }: { params: Promise<{ grade: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { grade } = await params;
  return <GradePage level="thpt" grade={Number(grade.replace('lop-', ''))} searchParams={searchParams} />;
}
