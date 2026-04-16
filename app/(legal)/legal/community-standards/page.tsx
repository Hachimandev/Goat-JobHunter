import type { Metadata } from 'next';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Community Standards | GOAT Job Hunter',
  description: 'Community behavior and content standards for GOAT Job Hunter.',
};

export default function CommunityStandardsPage() {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Legal Document</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Community Standards</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          These standards apply to profiles, job content, chat messages, group discussions, comments, and media shared
          across the GOAT ecosystem.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Effective date: 2026-04-16</p>
      </header>

      <Separator className="my-6" />

      <section className="space-y-6 text-sm leading-6 text-foreground">
        <div>
          <h2 className="text-lg font-semibold">1. Respectful Communication</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>No harassment, hate speech, threats, sexual exploitation, or humiliation.</li>
            <li>No stalking behavior or repeated unwanted contact in direct or group chat.</li>
            <li>No sharing of private personal information without consent.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">2. Safe Recruitment Conduct</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>No fake job opportunities or misleading role requirements.</li>
            <li>No scam offers requesting money, banking credentials, or suspicious transfers.</li>
            <li>No discrimination, coercion, or abusive interview behavior.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">3. Content And Media Restrictions</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>No malware files, phishing links, or harmful attachments.</li>
            <li>No explicit violent or sexual content outside lawful and policy-compliant contexts.</li>
            <li>No mass spam posting, fake engagement, or manipulation of community interactions.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">4. AI And Automation Boundaries</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>No abuse of AI tools to generate fraudulent applications or impersonation content.</li>
            <li>No automated harassment or coordinated manipulation through scripted behavior.</li>
            <li>Users remain accountable for content produced with AI assistance.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">5. Reporting And Enforcement</h2>
          <p className="text-muted-foreground">
            Violations can be reported through platform moderation channels. Enforcement may include warning, limited
            features, temporary suspension, or permanent account removal.
          </p>
        </div>
      </section>

      <Separator className="my-6" />

      <p className="text-sm text-muted-foreground">
        Related:{' '}
        <Link href="/legal/terms-of-service" className="text-primary hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/legal/user-policy" className="text-primary hover:underline">
          User Policy
        </Link>
      </p>
    </article>
  );
}
