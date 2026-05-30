import Link from "next/link";

export const metadata = {
  title: "About — Addvoxen",
  description:
    "Addvoxen is the AI Creative Suite for high-growth marketing teams — design, ship and analyze ad creatives in a single workspace.",
};

const VALUES = [
  {
    icon: "auto_awesome",
    title: "AI-native by default",
    body:
      "Every surface in Addvoxen is wired to our generative engine — copy, layout, resizing, even competitor research. You don't open a separate tool to use AI; it's already where you are.",
  },
  {
    icon: "bolt",
    title: "Built for speed",
    body:
      "Brief in the morning, ship by lunch. Magic Resize spins one square into every Meta / Google / TikTok / LinkedIn format in a single click, watermark-free on Pro.",
  },
  {
    icon: "verified",
    title: "Brand-safe",
    body:
      "Lock your palette, fonts and logo into a brand kit and Addvoxen enforces them across every team member, template and export. No more rogue creative.",
  },
  {
    icon: "trending_up",
    title: "Measurable",
    body:
      "Each banner ships with built-in analytics — views, clicks and CTA opens flow straight back into your dashboard so you know what works before scaling spend.",
  },
];

const STATS = [
  { value: "40+", label: "Official templates" },
  { value: "8", label: "Industry-tuned packs" },
  { value: "5", label: "Standard ad sizes per pack" },
  { value: "70/30", label: "Creator / platform split" },
];

const ROADMAP: Array<{
  status: "shipped" | "in-progress" | "soon";
  eta: string;
  title: string;
  body: string;
}> = [
  {
    status: "shipped",
    eta: "May 2026",
    title: "HTML5 banner export with clickTag",
    body:
      "Self-contained banner zips with IAB ad.size meta and Google Ads clickTag — ready for Display & Video 360 / Campaign Manager upload.",
  },
  {
    status: "shipped",
    eta: "May 2026",
    title: "Marketplace + community templates",
    body:
      "Buy and sell banner designs with a 70/30 creator split. Likes, comments and creator profiles included.",
  },
  {
    status: "shipped",
    eta: "May 2026",
    title: "Banner analytics",
    body:
      "Per-template views, clicks and CTA opens delivered as a creator-facing dashboard at /analytics.",
  },
  {
    status: "in-progress",
    eta: "June 2026",
    title: "AI text generation (Claude-powered)",
    body:
      "Headline, sub and CTA copy generated in 4 brand-aware variants. Wired in the editor — text endpoint goes live mid-June.",
  },
  {
    status: "in-progress",
    eta: "June 2026",
    title: "AI image generation",
    body:
      "Generate / extend / re-prompt photography directly on the canvas. Currently building the queue + safety filter on top of an image model.",
  },
  {
    status: "soon",
    eta: "July 2026",
    title: "Animated banners + GIF export",
    body:
      "Keyframe timeline, easing presets and Lottie import, exported as MP4 / GIF / animated HTML5 — for video-first inventory.",
  },
  {
    status: "soon",
    eta: "July 2026",
    title: "Brand kits + locked palettes",
    body:
      "Pin colours, fonts, logos and copy tone-of-voice per workspace so every export stays on-brand without manual review.",
  },
  {
    status: "soon",
    eta: "August 2026",
    title: "Managed Meta / Google / TikTok launch",
    body:
      "Hand off a finished banner and we host the campaign under Addvoxen Business Manager — no platform OAuth, no app review.",
  },
  {
    status: "soon",
    eta: "Q3 2026",
    title: "Team workspaces + roles",
    body:
      "Shared brand kits, role-scoped permissions (admin / editor / reviewer) and SSO for organisations.",
  },
  {
    status: "soon",
    eta: "Q4 2026",
    title: "Localised AI for AZ / TR / RU / ES",
    body:
      "Native-language AI copy with locale-aware tone presets, so a Baku-based DTC brand gets the same generative quality a US team gets.",
  },
];

export default function AboutPage() {
  return (
    <main className="pt-24 pb-20 px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="w-full max-w-5xl mx-auto">
        <header className="mb-14 text-center">
          <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-3">
            About Addvoxen
          </p>
          <h1 className="font-display-sm text-display-sm font-bold text-on-surface leading-tight">
            Precision luxury,
            <br />
            for the ads that fund the internet.
          </h1>
          <p className="text-on-surface-variant text-body-lg font-body-lg mt-6 max-w-2xl mx-auto">
            Addvoxen is an AI Creative Suite for marketing teams who refuse to
            ship mediocre work. We replace ten disjointed tools with one
            workspace — design, copy, resize, launch and measure, all in one
            place.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/editor?new=1"
              className="ai-gradient text-on-primary px-6 py-3 rounded-full text-label-md font-label-md hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] transition-all"
            >
              Try the editor
            </Link>
            <Link
              href="/marketplace"
              className="glass-panel px-6 py-3 rounded-full text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Browse templates
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
          {STATS.map((s) => (
            <div key={s.label} className="glass-panel rounded-2xl p-5 text-center">
              <p className="text-on-surface font-headline-lg text-headline-lg">
                {s.value}
              </p>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-wider mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {VALUES.map((v) => (
            <div key={v.title} className="glass-panel rounded-2xl p-6">
              <div className="w-11 h-11 rounded-xl ai-gradient flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-on-primary text-[22px]">
                  {v.icon}
                </span>
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
                {v.title}
              </h3>
              <p className="text-on-surface-variant text-body-md font-body-md leading-relaxed">
                {v.body}
              </p>
            </div>
          ))}
        </section>

        <section className="mb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
                Roadmap
              </p>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                What&apos;s shipping next
              </h2>
            </div>
            <p className="text-on-surface-variant text-label-sm font-label-sm hidden md:block">
              Tracked publicly so you always know what&apos;s next.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ROADMAP.map((r) => {
              const badge =
                r.status === "shipped"
                  ? { label: "Shipped", cls: "bg-tertiary text-on-tertiary" }
                  : r.status === "in-progress"
                    ? { label: "In progress", cls: "ai-gradient text-on-primary" }
                    : { label: "Coming soon", cls: "bg-surface-container-high text-on-surface-variant border border-white/15" };
              return (
                <div
                  key={r.title}
                  className="glass-panel rounded-2xl p-5 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full " +
                        badge.cls
                      }
                    >
                      {badge.label}
                    </span>
                    <span className="text-on-surface-variant text-label-sm font-label-sm">
                      {r.eta}
                    </span>
                  </div>
                  <h3 className="text-on-surface font-headline-lg-mobile text-headline-lg-mobile">
                    {r.title}
                  </h3>
                  <p className="text-on-surface-variant text-body-md font-body-md leading-relaxed">
                    {r.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-8 md:p-12 mb-16">
          <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-3">
            Origin
          </p>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
            Why Addvoxen exists
          </h2>
          <div className="text-on-surface-variant text-body-md font-body-md leading-relaxed space-y-4">
            <p>
              Performance marketing teams burn the majority of their cycle on
              creative production, not strategy. Briefs sit in Slack for days,
              designers ping-pong with copywriters, ten formats of one ad each
              get exported by hand, and post-launch nobody knows which variant
              actually moved the needle.
            </p>
            <p>
              Addvoxen collapses that loop into a single canvas. Generate the
              hook with AI, drop it into a brand-locked template, resize it
              into every platform pack, hand it off to your buyer — and watch
              the impression and click counts come back into the same view
              you started in. The whole production-to-insight cycle that used
              to take a week now takes an afternoon.
            </p>
            <p>
              We built it because the team behind Addvoxen ran growth at
              high-volume DTC brands and we got tired of doing the same
              hand-offs over and over. So we built the tool we wished existed.
            </p>
          </div>
        </section>

        <section className="text-center">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
            Ship better ads, faster.
          </h2>
          <p className="text-on-surface-variant text-body-md font-body-md mb-6 max-w-xl mx-auto">
            Free forever for individuals. Pro unlocks AI text + image,
            watermark-free exports and the full marketplace.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="ai-gradient text-on-primary px-6 py-3 rounded-full text-label-md font-label-md hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] transition-all"
            >
              Get started — free
            </Link>
            <Link
              href="/pricing"
              className="glass-panel px-6 py-3 rounded-full text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              See pricing
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
