import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Addvoxen",
  description: "How Addvoxen collects, uses and protects personal data.",
};

const LAST_UPDATED = "May 30, 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="pt-24 pb-20 px-4 sm:px-8 lg:px-16">
      <article className="w-full max-w-3xl mx-auto">
        <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
          Legal
        </p>
        <h1 className="font-display-sm text-display-sm font-bold text-on-surface mb-3">
          Privacy Policy
        </h1>
        <p className="text-on-surface-variant text-label-sm font-label-sm mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <Section title="1. Who we are">
          <p>
            &quot;Addvoxen&quot;, &quot;we&quot;, &quot;us&quot; refer to the
            Addvoxen team operating the Addvoxen Creative Suite at{" "}
            <code>addvoxen.com</code> and related sub-domains. This policy
            covers the website, the in-browser editor, the marketplace and
            any API or email we send.
          </p>
          <p>
            Contact: <a href="mailto:support@addvoxen.com">support@addvoxen.com</a>
          </p>
        </Section>

        <Section title="2. What we collect">
          <p>We collect three buckets of data:</p>
          <ul>
            <li>
              <strong>Account data</strong> — the email address and (optional)
              display name you sign up with, profile bio / handle / website /
              social links if you choose to add them, and a hashed password (we
              never see or store the plaintext, only a scrypt+salt digest).
            </li>
            <li>
              <strong>Product data</strong> — the designs you create, the
              templates you save and (if you publish to the marketplace) the
              public copies of those templates. We also keep usage counters
              such as monthly export counts and AI credits.
            </li>
            <li>
              <strong>Telemetry</strong> — banner-level events (views, clicks,
              CTA opens, exports) that power your analytics dashboard. IP
              addresses are hashed before storage so we can apply
              rate-limiting without keeping the raw address. We never sell
              telemetry to third parties.
            </li>
          </ul>
        </Section>

        <Section title="3. How we use it">
          <ul>
            <li>To deliver the service you signed up for — render designs,
              run AI generations, export files, send emails about your
              account.</li>
            <li>To enforce plan quotas (e.g. monthly export caps) and
              prevent fraud / abuse.</li>
            <li>To improve the product — usage metrics inform what we
              build next.</li>
            <li>To answer your support requests.</li>
          </ul>
          <p>
            We do <strong>not</strong> sell personal data and we do not use
            customer designs to train AI models without an explicit opt-in.
          </p>
        </Section>

        <Section title="4. Sub-processors">
          <p>
            We use a small set of vendors to run the service. Each is bound by
            a data processing agreement.
          </p>
          <ul>
            <li>
              <strong>Paddle</strong> — payment processing, tax compliance,
              invoicing. Handles your card / PayPal details. We never see
              the raw payment instrument.
            </li>
            <li>
              <strong>PayPal</strong> — direct PayPal payment option (if you
              choose it). Processes the transaction; we receive only the
              capture confirmation + payer email.
            </li>
            <li>
              <strong>Resend</strong> — transactional email (account
              verification, password reset, support replies). Receives your
              email address and the email body.
            </li>
            <li>
              <strong>Cloudflare R2 / Hetzner</strong> — file hosting +
              compute. Stores your designs and runs the application.
            </li>
            <li>
              <strong>Anthropic Claude</strong> — AI text generation (if you
              use that feature). Prompts and responses pass through the
              Anthropic API; Anthropic stores them per their privacy policy
              and does not use them to train models when called through the
              paid API.
            </li>
          </ul>
        </Section>

        <Section title="5. Cookies">
          <p>We use a minimal cookie set:</p>
          <ul>
            <li>
              <strong>Session cookie</strong> (essential) — keeps you signed
              in. Set by Better-Auth, HttpOnly + Secure.
            </li>
            <li>
              <strong>Preference cookies</strong> (functional) — remember your
              theme, language and country. Stored in <code>localStorage</code>,
              not sent to any server.
            </li>
          </ul>
          <p>
            We do not run third-party advertising or analytics cookies on the
            marketing surface. Telemetry from inside the product is
            first-party only.
          </p>
        </Section>

        <Section title="6. Your rights">
          <p>
            If you are in the EU / UK (GDPR), California (CCPA), or another
            jurisdiction with similar protections, you have the right to:
          </p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Correct anything that is inaccurate.</li>
            <li>Delete your account and the personal data tied to it.</li>
            <li>Export your data in a portable format.</li>
            <li>Object to certain processing (e.g. marketing email).</li>
          </ul>
          <p>
            Email <a href="mailto:support@addvoxen.com">support@addvoxen.com</a>{" "}
            with your request. We respond within 30 days.
          </p>
        </Section>

        <Section title="7. Data retention">
          <p>
            Account and design data is kept for as long as your account is
            active. When you delete your account we remove your personal data
            within 30 days and your designs immediately, except for records
            we are legally required to retain (e.g. tax invoices kept for 7
            years).
          </p>
          <p>
            Banner-event telemetry is anonymised after 13 months — we keep
            aggregates, not row-level events.
          </p>
        </Section>

        <Section title="8. Children">
          <p>
            Addvoxen is built for adult professionals. We do not knowingly
            collect data from anyone under 16. If you believe we have, write
            to <a href="mailto:support@addvoxen.com">support@addvoxen.com</a>{" "}
            and we will delete the account.
          </p>
        </Section>

        <Section title="9. International transfers">
          <p>
            Our infrastructure is hosted in the EU (Hetzner, Germany) and
            our payment processor (Paddle) operates globally. By using
            Addvoxen you consent to your personal data being transferred to
            and processed in the EU and, where Paddle requires, the United
            Kingdom or United States, under standard contractual clauses.
          </p>
        </Section>

        <Section title="10. Security">
          <p>
            Passwords are stored as scrypt+salt digests, never plaintext.
            Sessions use HttpOnly + Secure cookies. Database access is
            limited to the application service and locked behind a private
            network. We patch dependencies on a rolling basis and run
            automated security audits on each release.
          </p>
        </Section>

        <Section title="11. Changes">
          <p>
            We&apos;ll update this Privacy Policy as our product and vendors
            change. The date at the top tells you the current version. For
            material changes we&apos;ll email active accounts at least 14
            days before the change takes effect.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Privacy questions, data requests, or anything else:{" "}
            <a href="mailto:support@addvoxen.com">support@addvoxen.com</a>
          </p>
        </Section>

        <FooterNav />
      </article>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7">
      <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-3">
        {title}
      </h2>
      <div className="text-on-surface-variant text-body-md font-body-md leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:text-on-surface [&_a]:text-primary [&_a]:hover:underline [&_code]:bg-surface-container-high/60 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-on-surface">
        {children}
      </div>
    </section>
  );
}

function FooterNav() {
  return (
    <nav className="mt-12 pt-6 border-t border-white/10 flex flex-wrap gap-4 text-label-sm font-label-sm text-on-surface-variant">
      <Link href="/terms" className="hover:text-on-surface">
        Terms of Service
      </Link>
      <Link href="/privacy" className="text-on-surface">
        Privacy Policy
      </Link>
      <Link href="/refund" className="hover:text-on-surface">
        Refund Policy
      </Link>
      <Link href="/support" className="hover:text-on-surface ml-auto">
        Contact support
      </Link>
    </nav>
  );
}
