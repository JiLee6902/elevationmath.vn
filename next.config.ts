import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Build ra .next/standalone để Docker image gọn (~150MB thay vì >1GB)
  output: 'standalone',
  experimental: {
    // Đỡ phải tree-shake từng icon trong lucide-react / từng date function
    // → giảm thời gian compile lần đầu ~50-70%.
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      '@tanstack/react-table',
    ],
  },
  // Chấp nhận hình do user upload (qua MinIO sau Caddy) + ảnh demo
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Cho phép mọi hostname để presigned URL hoạt động (URL ký theo domain)
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Tắt typed routes để tránh lỗi với prefix dynamic segment
  typedRoutes: false,
};

export default nextConfig;
