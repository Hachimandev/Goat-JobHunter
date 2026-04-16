import type { Metadata } from 'next';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'User Policy | GOAT Job Hunter',
  description: 'User data and privacy policy for GOAT Job Hunter social chat and job features.',
};

export default function UserPolicyPage() {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Legal Document</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">User Policy</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This policy explains how GOAT Job Hunter handles personal information across social interactions, chat,
          applications, interviews, and company-user communication.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Effective date: 2026-04-16</p>
      </header>

      <Separator className="my-6" />

      <section className="space-y-6 text-sm leading-6 text-foreground">
        <div>
          <h2 className="text-lg font-semibold">1. Data We Collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Account data: name, email, profile media, and authentication records.</li>
            <li>Professional data: resume, skills, job applications, interview scheduling and status.</li>
            <li>Interaction data: chat messages, media files, social reactions, comments, and notifications.</li>
            <li>Security data: device identifiers, session cookies, and abuse-prevention logs.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">2. Why We Process Data</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Deliver hiring and messaging features requested by users.</li>
            <li>Protect users against fraud, impersonation, harassment, and account abuse.</li>
            <li>Improve product quality, recommendation relevance, and platform reliability.</li>
            <li>Meet legal obligations for compliance, security, and law enforcement requests.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">3. Sharing And Visibility Rules</h2>
          <p className="text-muted-foreground">
            We share only the minimum required data between applicants, recruiters, and companies based on user actions
            and visibility settings.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Profile visibility controls influence who can discover and contact you.</li>
            <li>Application data is shared with target recruiters and authorized company accounts only.</li>
            <li>Moderation teams may access reports and related content for enforcement reviews.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">4. Retention And Security</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>We retain data only as needed for service operation, legal obligations, and dispute handling.</li>
            <li>Encrypted transport, access controls, and monitoring help protect user data.</li>
            <li>Users should protect credentials and enable secure account practices.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">5. User Rights</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Request access to your data and update inaccurate profile details.</li>
            <li>Request deletion or restriction under applicable legal conditions.</li>
            <li>Manage communication and visibility preferences from account settings.</li>
          </ul>
        </div>
      </section>

      <Separator className="my-6" />

      <p className="text-sm text-muted-foreground">
        Related:{' '}
        <Link href="/legal/terms-of-service" className="text-primary hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/legal/community-standards" className="text-primary hover:underline">
          Community Standards
        </Link>
      </p>
    </article>
  );
}
