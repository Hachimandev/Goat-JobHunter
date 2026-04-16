import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const LEGAL_NAV_LINKS = [
  { href: '/legal', label: 'Trung tâm pháp lý' },
  { href: '/legal/terms-of-service', label: 'Điều khoản dịch vụ' },
  { href: '/legal/user-policy', label: 'Chính sách người dùng' },
  { href: '/legal/community-standards', label: 'Tiêu chuẩn cộng đồng' },
] as const;

export const metadata: Metadata = {
  title: 'Trung tâm pháp lý | GOAT Job Hunter',
  description: 'Điều khoản dịch vụ, Chính sách người dùng và Tiêu chuẩn cộng đồng của GOAT Job Hunter.',
};

export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="GOAT Logo" className="" width={80} height={80} />
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            {LEGAL_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
