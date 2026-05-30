import Link from "next/link";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: "rocket_launch",
    title: "One-click launch to Meta / Google / TikTok",
    body:
      "Hand off a finished banner and we host the campaign under the Addvoxen Business Manager — no platform OAuth, no app review on your end.",
  },
  {
    icon: "monitoring",
    title: "Stats land back in your dashboard",
    body:
      "Impressions, clicks, CTR, conversions and spend stream into the same view you launched from. No tab-switching.",
  },
  {
    icon: "auto_awesome",
    title: "AI-generated audience + bid suggestions",
    body:
      "We pre-fill the targeting brief from the banner copy + your brand kit so you can ship within 90 seconds of finalising the creative.",
  },
];

/**
 * Campaigns are on the roadmap — until the Business Manager + bidding rails
 * are live we show a high-fidelity preview of what's coming so users
 * understand the surface exists.
 */
export default function CampaignsPage() {
  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-3">
            Coming soon · Q3 2026
          </p>
          <h1 className="font-display-sm text-display-sm font-bold text-on-surface mb-4">
            Managed ad campaigns.
            <br />
            <span className="bg-linear-to-r from-primary to-tertiary bg-clip-text text-transparent">
              From canvas to live in 90 seconds.
            </span>
          </h1>
          <p className="text-on-surface-variant text-body-lg font-body-lg max-w-2xl mx-auto">
            Addvoxen will host campaigns under our own Meta, Google and TikTok
            Business Manager accounts. You upload the brief, we own the
            platform compliance, you get the stats. No ad accounts, no app
            review, no FB Pixel debugging.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <Link
              href="/about#roadmap"
              className="glass-panel px-6 py-3 rounded-full text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              See full roadmap
            </Link>
            <Link
              href="/editor?new=1"
              className="ai-gradient text-on-primary px-6 py-3 rounded-full text-label-md font-label-md hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] transition-all"
            >
              Design a banner first
            </Link>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-panel rounded-2xl p-6">
              <div className="w-11 h-11 rounded-xl ai-gradient flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-on-primary text-[22px]">
                  {f.icon}
                </span>
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
                {f.title}
              </h3>
              <p className="text-on-surface-variant text-body-md font-body-md leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </section>

        <section className="glass-panel rounded-3xl p-8 md:p-10 text-center">
          <div className="w-14 h-14 rounded-2xl ai-gradient flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-on-primary text-2xl">
              schedule
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-3">
            We&apos;re still wiring this up
          </h2>
          <p className="text-on-surface-variant text-body-md font-body-md max-w-xl mx-auto mb-6">
            The Business Manager hosts + bidding API are in setup. Once the
            entity is registered (target Q3 2026) you&apos;ll be able to
            launch and monitor right from this page.
          </p>
          <p className="text-on-surface-variant text-label-sm font-label-sm">
            Want early access? Email{" "}
            <a
              href="mailto:support@addvoxen.com?subject=Campaigns%20early%20access"
              className="text-primary hover:underline"
            >
              support@addvoxen.com
            </a>{" "}
            and we&apos;ll add you to the first batch.
          </p>
        </section>
      </div>
    </main>
  );
}
