import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LEGAL_PAGES = [
  {
    href: '/legal/terms-of-service',
    title: 'Terms of Service',
    description:
      'Rules for account usage, messaging safety, recruitment integrity, and service enforcement across the platform.',
  },
  {
    href: '/legal/user-policy',
    title: 'User Policy',
    description:
      'How user data is collected, processed, shared, retained, and protected in social, chat, and job workflows.',
  },
  {
    href: '/legal/community-standards',
    title: 'Community Standards',
    description:
      'Behavior and content standards to keep chat, social interactions, and job recruitment safe and professional.',
  },
] as const;

export const metadata: Metadata = {
  title: 'Legal Center | GOAT Job Hunter',
  description: 'Explore legal documents for GOAT Job Hunter social chat and job ecosystem.',
};

export default function LegalCenterPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Legal Hub</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Platform Rules And User Protections</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          This legal center defines how GOAT Job Hunter operates across social networking, direct and group chat,
          AI-assisted conversations, and hiring workflows.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Effective date: 2026-04-16</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEGAL_PAGES.map((page) => (
          <Card key={page.href} className="border-border bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg">{page.title}</CardTitle>
              <CardDescription>{page.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={page.href} className="text-sm font-medium text-primary hover:underline">
                Read document
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
