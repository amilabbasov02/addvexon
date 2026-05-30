import { SupportForm } from "./SupportForm";

export const metadata = {
  title: "Support — Addvoxen",
  description: "Reach the Addvoxen team — bug reports, billing questions and partnerships.",
};

export default function SupportPage() {
  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16">
      <div className="w-full max-w-2xl mx-auto">
        <header className="mb-8">
          <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
            Help center
          </p>
          <h1 className="font-display-sm text-display-sm font-bold text-on-surface">
            Talk to the team
          </h1>
          <p className="text-on-surface-variant text-body-md font-body-md mt-3">
            Bug? Billing question? Partnership idea? Drop a note below and
            we&apos;ll reply within one business day.
          </p>
          <p className="text-on-surface-variant text-label-sm font-label-sm mt-3">
            Or email{" "}
            <a
              href="mailto:support@addvoxen.com"
              className="text-primary hover:underline"
            >
              support@addvoxen.com
            </a>{" "}
            directly.
          </p>
        </header>
        <SupportForm />
      </div>
    </main>
  );
}
