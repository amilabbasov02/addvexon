import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Addvoxen",
  description:
    "The terms that govern your use of the Addvoxen Creative Suite.",
};

const LAST_UPDATED = "May 30, 2026";

export default function TermsOfServicePage() {
  return (
    <main className="pt-24 pb-20 px-4 sm:px-8 lg:px-16">
      <article className="w-full max-w-3xl mx-auto">
        <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
          Legal
        </p>
        <h1 className="font-display-sm text-display-sm font-bold text-on-surface mb-3">
          Terms of Service
        </h1>
        <p className="text-on-surface-variant text-label-sm font-label-sm mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <Section title="1. Acceptance">
          <p>
            By creating an Addvoxen account or using any part of the service
            you agree to these Terms. If you don&apos;t agree, please don&apos;t
            use the service. These Terms form a legal agreement between you
            and Addvoxen.
          </p>
        </Section>

        <Section title="2. The service">
          <p>
            Addvoxen is a software-as-a-service creative suite for designing,
            resizing, and exporting ad creatives. We offer:
          </p>
          <ul>
            <li>An in-browser editor with templates, AI text/image
              generation and multi-format export.</li>
            <li>A marketplace where creators can buy and sell template
              designs under the 70/30 creator/platform split.</li>
            <li>Optional managed-campaign tooling (coming in a later
              release).</li>
          </ul>
          <p>
            We add and improve features continuously. We may also retire
            features when they no longer fit the product, with reasonable
            notice for paying customers.
          </p>
        </Section>

        <Section title="3. Account">
          <p>
            You need an account to use the paid surfaces. You agree to:
          </p>
          <ul>
            <li>Provide accurate registration info and keep it current.</li>
            <li>Keep your password and any API tokens confidential.</li>
            <li>Be responsible for everything that happens on your account
              until you tell us it&apos;s compromised.</li>
            <li>Be at least 16 years old (or the local age of digital
              consent, whichever is higher).</li>
          </ul>
        </Section>

        <Section title="4. Plans, billing and renewals">
          <p>
            Paid plans (Pro, Team, Enterprise) renew automatically at the end
            of each billing cycle (monthly or yearly) at the price displayed
            on the pricing page, until you cancel. You can cancel at any time
            from your account settings or by emailing{" "}
            <a href="mailto:support@addvoxen.com">support@addvoxen.com</a>.
            Cancellation takes effect at the end of the paid period.
          </p>
          <p>
            We may change pricing for future billing cycles with at least
            30 days&apos; advance notice via email; if you don&apos;t want
            the new price you can cancel before it takes effect.
          </p>
          <p>
            All purchases are processed through Paddle, our merchant of
            record, or PayPal at your choice. Taxes (VAT, sales tax) are
            collected by Paddle as required by your jurisdiction.
          </p>
        </Section>

        <Section title="5. Refunds">
          <p>
            Refunds are governed by the{" "}
            <Link href="/refund" className="text-primary hover:underline">
              Refund Policy
            </Link>
            . In short: 14-day money-back guarantee on new subscriptions,
            no pro-rated refunds after that window except for our own
            billing errors or material service failures.
          </p>
        </Section>

        <Section title="6. Your content">
          <p>
            You keep all rights to the designs, images, copy, brand assets,
            and any other content you upload or create with Addvoxen
            (&quot;Your Content&quot;). You grant us a limited, worldwide,
            royalty-free licence to host, transmit, render, resize, and
            display Your Content as needed to provide the service to you and
            your team.
          </p>
          <p>
            You are responsible for ensuring that Your Content does not
            infringe anyone else&apos;s rights. If you sell templates on the
            marketplace, you confirm you own (or have permission to use) every
            element in them.
          </p>
        </Section>

        <Section title="7. Marketplace">
          <p>
            Templates listed for sale by creators are governed by both these
            Terms and the marketplace listing terms. Addvoxen takes a 30%
            platform fee, the creator receives 70%, payouts run monthly via
            Paddle or PayPal once a creator passes the $50 threshold.
          </p>
          <p>
            We may take down listings that violate our rules (IP infringement,
            disallowed content, deceptive previews, low quality) at our
            discretion.
          </p>
        </Section>

        <Section title="8. Acceptable use">
          <p>You agree not to:</p>
          <ul>
            <li>Use Addvoxen to produce content that infringes copyrights,
              trademarks or rights of publicity.</li>
            <li>Run political disinformation, scams, illegal gambling,
              fraudulent claims, or content that targets minors.</li>
            <li>Reverse-engineer or attempt to scrape data from the
              service.</li>
            <li>Resell access (a single account is for a single
              person/team; Team plan covers the seats listed on the plan).</li>
            <li>Probe, attack, or interfere with the service&apos;s
              infrastructure.</li>
          </ul>
          <p>
            We may suspend or terminate accounts that violate this section,
            without notice for severe violations.
          </p>
        </Section>

        <Section title="9. AI features">
          <p>
            Where Addvoxen produces text or images via AI, you understand
            that:
          </p>
          <ul>
            <li>Generated output may be similar to other outputs other users
              have prompted; we do not guarantee uniqueness.</li>
            <li>You are responsible for reviewing AI output before publishing
              it — accuracy, brand safety and legal claims are your call.</li>
            <li>We do not train models on your prompts or designs.</li>
          </ul>
        </Section>

        <Section title="10. Intellectual property">
          <p>
            We own the Addvoxen platform, brand, official templates,
            documentation and code. You may not copy, modify or redistribute
            any of these except to the extent permitted by these Terms or
            applicable law.
          </p>
        </Section>

        <Section title="11. Warranties &amp; disclaimer">
          <p>
            We aim to keep the service available, fast and accurate, but it
            is provided &quot;as-is&quot;. To the maximum extent permitted by
            law we disclaim implied warranties of merchantability, fitness
            for a particular purpose and non-infringement.
          </p>
        </Section>

        <Section title="12. Limitation of liability">
          <p>
            To the extent permitted by law, Addvoxen&apos;s aggregate
            liability for any claim arising out of or relating to the service
            is limited to the amount you paid us in the 12 months immediately
            before the event giving rise to the claim. We are not liable for
            indirect, incidental, consequential, special, exemplary or
            punitive damages, or for lost profits, even if advised of the
            possibility.
          </p>
        </Section>

        <Section title="13. Termination">
          <p>
            You can close your account at any time from settings. We may
            suspend or terminate accounts that violate these Terms, that
            present unreasonable risk to other customers, or that we
            reasonably believe are involved in fraud or chargeback abuse.
            Sections that by their nature should survive (IP, liability,
            indemnity, governing law) survive termination.
          </p>
        </Section>

        <Section title="14. Changes to these Terms">
          <p>
            We&apos;ll post material updates here and notify active accounts
            by email at least 14 days before they take effect. Continued use
            of the service after the change date means you accept the new
            Terms.
          </p>
        </Section>

        <Section title="15. Governing law &amp; venue">
          <p>
            These Terms are governed by the laws of the Republic of
            Azerbaijan, without regard to conflict-of-laws principles. Any
            dispute that can&apos;t be resolved informally will be brought
            before the competent courts of Baku, Azerbaijan, unless the
            mandatory consumer-protection law of your residence requires
            otherwise.
          </p>
        </Section>

        <Section title="16. Contact">
          <p>
            Questions, complaints, takedown notices and partnership
            inquiries:{" "}
            <a href="mailto:support@addvoxen.com">support@addvoxen.com</a>.
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
      <div className="text-on-surface-variant text-body-md font-body-md leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:text-on-surface [&_a]:text-primary [&_a]:hover:underline">
        {children}
      </div>
    </section>
  );
}

function FooterNav() {
  return (
    <nav className="mt-12 pt-6 border-t border-white/10 flex flex-wrap gap-4 text-label-sm font-label-sm text-on-surface-variant">
      <Link href="/terms" className="text-on-surface">
        Terms of Service
      </Link>
      <Link href="/privacy" className="hover:text-on-surface">
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
