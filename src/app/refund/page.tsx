import Link from "next/link";

export const metadata = {
  title: "Refund Policy — Addvoxen",
  description: "Addvoxen's refund and cancellation policy for SaaS subscriptions.",
};

const LAST_UPDATED = "May 30, 2026";

export default function RefundPolicyPage() {
  return (
    <main className="pt-24 pb-20 px-4 sm:px-8 lg:px-16">
      <article className="w-full max-w-3xl mx-auto prose-legal">
        <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
          Legal
        </p>
        <h1 className="font-display-sm text-display-sm font-bold text-on-surface mb-3">
          Refund Policy
        </h1>
        <p className="text-on-surface-variant text-label-sm font-label-sm mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <Section title="1. Our commitment">
          <p>
            We want every Addvoxen customer to feel the product is worth what
            they pay for it. If something didn&apos;t work for you, this page
            spells out exactly when, how, and to what extent we&apos;ll refund
            your subscription.
          </p>
        </Section>

        <Section title="2. 14-day money-back guarantee">
          <p>
            All new paid subscriptions (Pro, Team, Enterprise) come with a{" "}
            <strong>14-day money-back guarantee</strong> from the day of the
            first successful charge. If you cancel and request a refund within
            this window we will issue a full refund to the original payment
            method — no questions asked.
          </p>
          <p>
            This guarantee applies once per customer per plan tier. Re-upgrading
            after a refund and requesting a second refund is not eligible.
          </p>
        </Section>

        <Section title="3. After the 14-day window">
          <p>
            Past the initial 14 days, subscriptions are non-refundable for the
            current billing cycle (monthly or yearly). You can cancel any time
            from your account settings; the cancellation takes effect at the end
            of the paid period and you will not be charged again. We do not
            issue pro-rated refunds for partial months / years.
          </p>
          <p>Exceptions we do refund outside the 14 days:</p>
          <ul>
            <li>
              You were charged twice for the same period due to a billing bug
              on our side.
            </li>
            <li>
              A material feature explicitly listed as included on your plan was
              unavailable for more than 7 consecutive days and we couldn&apos;t
              restore it.
            </li>
            <li>
              Fraudulent use of your payment method — please first dispute
              through the card issuer; we will cooperate with our payment
              processor (Paddle) to refund verified cases.
            </li>
          </ul>
        </Section>

        <Section title="4. Marketplace template purchases">
          <p>
            Individual template purchases from the Addvoxen Marketplace are
            digital goods delivered immediately on payment. Because the file is
            usable the moment it is purchased, we generally do not refund
            template purchases.
          </p>
          <p>
            We will refund a marketplace template if it is fundamentally
            different from what its preview showed, contains content the
            creator did not have rights to use, or fails to open in the editor
            due to a defect on our side. Contact us within 7 days of purchase.
          </p>
        </Section>

        <Section title="5. How to request a refund">
          <p>Email{" "}
            <a
              href="mailto:support@addvoxen.com?subject=Refund%20request"
              className="text-primary hover:underline"
            >
              support@addvoxen.com
            </a>{" "}
            with:
          </p>
          <ul>
            <li>The email address on the account</li>
            <li>The Paddle / PayPal / bank reference of the charge</li>
            <li>One sentence on the reason (optional but appreciated)</li>
          </ul>
          <p>
            We reply within one business day. Approved refunds are issued
            back to the original payment method within 5–10 business days
            depending on your bank / card network.
          </p>
        </Section>

        <Section title="6. Chargebacks">
          <p>
            We&apos;d much rather refund you than receive a chargeback. If you
            file a chargeback before contacting us, we will pause your account
            until the dispute is resolved and will provide the relevant
            transaction records to the card network.
          </p>
        </Section>

        <Section title="7. Changes to this policy">
          <p>
            We may update this Refund Policy as our product and payment rails
            change. The version at the top of this page is always current; we
            will notify active subscribers of any material change at least 14
            days before it takes effect.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>
            Refunds, billing or anything else:{" "}
            <a
              href="mailto:support@addvoxen.com"
              className="text-primary hover:underline"
            >
              support@addvoxen.com
            </a>
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
      <div className="text-on-surface-variant text-body-md font-body-md leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:text-on-surface [&_a]:text-primary">
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
      <Link href="/privacy" className="hover:text-on-surface">
        Privacy Policy
      </Link>
      <Link href="/refund" className="text-on-surface">
        Refund Policy
      </Link>
      <Link href="/support" className="hover:text-on-surface ml-auto">
        Contact support
      </Link>
    </nav>
  );
}
