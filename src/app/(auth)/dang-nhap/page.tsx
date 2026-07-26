import Link from 'next/link';
import { LoginForm } from './login-form';
import { AuthShell } from '@/components/auth/auth-shell';

export const metadata = { title: 'Đăng nhập — Elevation Math' };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <AuthShell
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục học toán cùng cộng đồng."
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link
            href="/dang-ky"
            className="text-primary font-medium hover:underline underline-offset-2"
          >
            Đăng ký
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
