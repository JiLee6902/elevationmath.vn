import Link from 'next/link';
import { RegisterForm } from './register-form';
import { AuthShell } from '@/components/auth/auth-shell';

export const metadata = { title: 'Đăng ký — Elevation Math' };

export default function Page() {
  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Tham gia cộng đồng để upload và đánh giá tài liệu."
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link
            href="/dang-nhap"
            className="text-primary font-medium hover:underline underline-offset-2"
          >
            Đăng nhập
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
