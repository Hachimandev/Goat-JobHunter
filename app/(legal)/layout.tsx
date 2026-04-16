import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const LEGAL_NAV_LINKS = [
  { href: '/legal', label: 'Legal Center' },
  { href: '/legal/terms-of-service', label: 'Terms' },
  { href: '/legal/user-policy', label: 'User Policy' },
  { href: '/legal/community-standards', label: 'Community Standards' },
] as const;

export const metadata: Metadata = {
  title: 'Legal Center | GOAT Job Hunter',
  description: 'Terms of Service, User Policy, and Community Standards for GOAT Job Hunter.',
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
            <Image src="/logo.png" alt="GOAT Logo" width={56} height={56} />
            <span className="text-sm font-semibold text-foreground">GOAT Legal</span>
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

      <footer className="border-t border-border bg-muted/30 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>Legal documents for GOAT Job Hunter social chat and job platform.</p>
          <p>Last legal review cycle: April 2026.</p>
        </div>
      </footer>
    </div>
  );
}
