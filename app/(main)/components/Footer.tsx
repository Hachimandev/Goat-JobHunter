import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-primary/5 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="GOAT Logo" className="" width={80} height={80} />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">Nền tảng tìm kiếm việc làm tuyệt vời</p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Cho Ứng Viên</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
                  Tìm Việc Làm
                </Link>
              </li>
              <li>
                <Link href="/companies" className="text-muted-foreground hover:text-foreground">
                  Các Công Ty
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-foreground">
                  Hồ Sơ Cá Nhân
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Cho Nhà Tuyển Dụng</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/post-job" className="text-muted-foreground hover:text-foreground">
                  Đăng Việc Làm
                </Link>
              </li>
              <li>
                <Link href="/employer-dashboard" className="text-muted-foreground hover:text-foreground">
                  Bảng Điều Khiển
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                  Giá Cả
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Công Ty</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  Về Chúng Tôi
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Liên Hệ
                </Link>
              </li>
              <li>
                <Link href="/legal/terms-of-service" className="text-muted-foreground hover:text-foreground">
                  Điều Khoản Dịch Vụ
                </Link>
              </li>
              <li>
                <Link href="/legal/user-policy" className="text-muted-foreground hover:text-foreground">
                  Chính Sách Người Dùng
                </Link>
              </li>
              <li>
                <Link href="/legal/community-standards" className="text-muted-foreground hover:text-foreground">
                  Tiêu Chuẩn Cộng Đồng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 GOAT Job Search. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
