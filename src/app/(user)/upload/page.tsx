import { redirect } from 'next/navigation';

// Đóng góp phía người dùng đã tắt — chỉ quản trị viên thêm tài liệu (qua /admin).
export default function Page() {
  redirect('/');
}
