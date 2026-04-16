import type { Metadata } from 'next';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Terms of Service | GOAT Job Hunter',
  description: 'Terms of service for the GOAT Job Hunter social chat and job platform.',
};

export default function TermsOfServicePage() {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Legal Document</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Terms of Service</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          By using GOAT Job Hunter, you agree to these terms for social communication, professional networking, and
          recruitment activities.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Effective date: 2026-04-16</p>
      </header>

      <Separator className="my-6" />

      <section className="space-y-6 text-sm leading-6 text-foreground">
        <div>
          <h2 className="text-lg font-semibold">1. Account Eligibility And Responsibility</h2>
          <p>
            You must provide accurate registration information, maintain account security, and avoid sharing credentials
            with unauthorized parties.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Each user must use one truthful identity for personal use cases.</li>
            <li>Recruiter and company accounts must represent legitimate business entities.</li>
            <li>You are responsible for actions performed through your account.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">2. Recruitment Integrity</h2>
          <p>
            Job postings, interview communication, and applicant evaluation must be fair, lawful, and non-deceptive.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>No fake vacancies, misleading compensation claims, or hidden fees.</li>
            <li>No solicitation for unlawful payments from applicants.</li>
            <li>No discriminatory hiring practices that violate applicable laws.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">3. Chat And Media Usage</h2>
          <p>
            Messaging must remain respectful, safe, and lawful. Users may not distribute malware, abusive content, or
            personal data obtained without consent.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>No harassment, threats, or persistent unwanted contact.</li>
            <li>No malicious files, phishing links, or unsafe media uploads.</li>
            <li>No impersonation of candidates, recruiters, companies, or administrators.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">4. AI Assistant Usage</h2>
          <p>
            AI features are provided for informational support only and must not be used for abuse, fraud, or harmful
            automation.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>AI responses are not legal, financial, or medical advice.</li>
            <li>Users remain responsible for decisions made from AI suggestions.</li>
            <li>Abusive prompts or misuse of AI outputs may trigger enforcement actions.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">5. Enforcement And Service Limits</h2>
          <p>
            GOAT may issue warnings, restrict features, suspend, or terminate accounts for policy violations or security
            threats. Service availability may change for maintenance or legal compliance.
          </p>
        </div>
      </section>

      <Separator className="my-6" />

      <p className="text-sm text-muted-foreground">
        Related:{' '}
        <Link href="/legal/user-policy" className="text-primary hover:underline">
          User Policy
        </Link>{' '}
        and{' '}
        <Link href="/legal/community-standards" className="text-primary hover:underline">
          Community Standards
        </Link>
      </p>
    </article>
  );
}
