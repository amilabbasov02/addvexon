"use client";
// Auto-generated from stitch-html/. Edit the source HTML and rerun
// `node scripts/convert-stitch.mjs` if you need to regenerate.
/* eslint-disable @next/next/no-img-element, react/no-unknown-property, @typescript-eslint/no-unused-vars */
import * as React from "react";
import { useLocale } from "@/components/site/LocaleContext";

export default function LandingPage() {
  const { t } = useLocale();
  return (
    <div data-stitch-theme="dark" className="addvoxen-stitch-screen">
      {/* Navigation Shell */}
      <main className="pt-32">
      {/* Hero Section */}
      <section className="relative px-margin-mobile md:px-margin-desktop mb-xl overflow-visible">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary-container/10 border border-primary/20 text-primary-fixed-dim font-label-sm text-label-sm mb-8 animate-pulse">
      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                          {t("home.hero.eyebrow")}
                      </div>
      <h1 className="font-display-lg text-display-lg max-w-4xl mb-6 bg-gradient-to-b from-on-surface to-on-surface/50 bg-clip-text text-transparent">
                          {t("home.hero.title")}
                      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-12">
                          {t("home.hero.body")}
                      </p>
      <div className="flex flex-col sm:flex-row gap-4 mb-xl">
      <a className="ai-gradient text-on-primary font-label-md text-label-md px-10 py-4 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2" href="/editor?new=1" role="button">
                              {t("home.hero.primary")}
                              <span className="material-symbols-outlined">arrow_forward</span>
      </a>
      <a className="glass-panel text-on-surface font-label-md text-label-md px-10 py-4 rounded-xl hover:bg-white/5 transition-all" href="#showcase" role="button">
                              {t("home.hero.secondary")}
                          </a>
      </div>
      {/* Floating Banner Preview */}
      <div className="relative w-full max-w-5xl mt-8">
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-tertiary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="glass-panel rounded-3xl p-4 md:p-8 transform perspective-1000 rotate-x-2 shadow-2xl relative z-10 overflow-hidden">
      <div className="shimmer absolute inset-0"></div>
      <img alt="AI Banner Preview" className="w-full h-auto rounded-xl shadow-inner border border-white/5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjG_CKgg6mdjXBLAcd8z7u7tjNcFCHujIa1PIH6p8GZqs4IN-SvoRfPPHJaU1EXR7X2fVIETb7-iGjWJxBzTFmZEZoHbmLYnrDIcaH7GmKD6PsJCYYi1dH6AR07ksM0VZhg3o5HCe6M39N_nM8s7zHkl51HnDI_nU8x4xE84WEcDyQ8Zy-lauIi0v4Erzg-IeqIDLG1z8LeqDBZJMukC6Nab8SdcktVoDPjCXb4SB5PeRl3F2UEqZy7jcq6BOEbPep3JBitHCLlk4c" />
      {/* Floating Micro-UI Elements */}
      <div className="absolute top-12 left-12 glass-panel p-4 rounded-2xl hidden md:block animate-bounce shadow-2xl">
      <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
      <span className="material-symbols-outlined text-green-400">trending_up</span>
      </div>
      <div>
      <p className="font-label-sm text-label-sm text-on-surface-variant">CTR Boost</p>
      <p className="font-label-md text-label-md font-bold text-on-surface">+124%</p>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
      </section>
      {/* Trusted By */}
      <section className="py-xl bg-surface-container-lowest/50">
      <div className="max-w-7xl mx-auto px-margin-desktop">
      <p className="text-center font-label-sm text-label-sm text-outline mb-10 tracking-[0.2em] uppercase">Trusted by Global Innovators</p>
      <div className="flex flex-wrap justify-center items-center gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
      <span className="font-display-sm text-display-sm font-bold tracking-tighter">NEXUS</span>
      <span className="font-display-sm text-display-sm font-bold tracking-tighter italic">VORTEX</span>
      <span className="font-display-sm text-display-sm font-bold tracking-tighter">ZENITH</span>
      <span className="font-display-sm text-display-sm font-bold tracking-tighter italic underline decoration-primary">PULSE</span>
      <span className="font-display-sm text-display-sm font-bold tracking-tighter">QUANTUM</span>
      </div>
      </div>
      </section>
      {/* Trending Templates */}
      <section className="py-xl px-margin-mobile md:px-margin-desktop">
      <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
      <div>
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Trending Templates</h2>
      <p className="font-body-md text-body-md text-on-surface-variant">Selected by our elite creative directors.</p>
      </div>
      <a className="text-primary font-label-md text-label-md flex items-center gap-2 hover:gap-3 transition-all" href="/marketplace" role="button">
                              Browse Gallery <span className="material-symbols-outlined">chevron_right</span>
      </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
      {/* Template Card 1 */}
      <div className="group glass-panel rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-500">
      <div className="aspect-[4/5] overflow-hidden">
      <img alt="Modern Minimal" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCn4onfvhSl_BVzm3P4_MdkQY59Zl1DrPLZF70nXqQHflsQaNyS6wwU2BfpIsWhLDwBi7d6H7roB8lCn4buYPZ5z5SD4wDik1ny14xijQKeSP18TWDBjDHszL9owj_Eno4qbe3M8eg9fgEhyvxk3tK_JtImOgBW3rtwo0MsnK_Dnu-bE5iWpNfgUvkR_3UsJg9D2h0gYNrdpVZkUAzFpbM7aC_jnz7qH5dklVxpPhfgfxChpTbn-JEpmbrJtKYJ7nYMElrEuQLz9kTf" />
      </div>
      <div className="p-6">
      <div className="flex justify-between items-start mb-4">
      <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Neo-Minimal</h3>
      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">High CTR</span>
      </div>
      <a className="w-full py-3 rounded-xl border border-white/10 hover:bg-primary hover:text-on-primary transition-all font-label-md text-label-md" href="/editor?new=1" role="button">Use Template</a>
      </div>
      </div>
      {/* Template Card 2 */}
      <div className="group glass-panel rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-500">
      <div className="aspect-[4/5] overflow-hidden">
      <img alt="Vibrant Tech" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCELoea6b1VqNqWMr5L5y0pJP8PG3b7unEkaKBEp-bMkm43kB0oA5ghAl41Xei-joPoHox8Sdc3eaPh4r0hYGOTogRspLKEzWpx5Tn4t-dwajFD8210BCOmf-hdOtOlDOnaM5Syv8cxSWlJfd3hY_BMysmqU2BRTVxQcdd35MiI8lDFPxq5LatG1l-jL_KHJAbKF1_aOh9K1ZsdpvXIzccvfZonKFHR_df_0PWUh-KBVgfZsNgEb21widssWHicABuBVJ_5oaf5wp3r" />
      </div>
      <div className="p-6">
      <div className="flex justify-between items-start mb-4">
      <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Cyber Flow</h3>
      <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm">Trending</span>
      </div>
      <a className="w-full py-3 rounded-xl border border-white/10 hover:bg-primary hover:text-on-primary transition-all font-label-md text-label-md" href="/editor?new=1" role="button">Use Template</a>
      </div>
      </div>
      {/* Template Card 3 */}
      <div className="group glass-panel rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-500">
      <div className="aspect-[4/5] overflow-hidden">
      <img alt="Silk Smooth" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVT2GBJLBZCIFzsZ0YPNb1GydupVnaOPFijaViJzV2i1mZYCoMF2yGNAhGH0NunDt1KjdaObv919nUd3QX-oICis5In7jy6i7j7gkPZIGx3DTFPy6bzVrE4WSotiY9UifG7UXQw22LMczgDsNlImdGIgKzql9k9R1lXlJl8WMcYHuUIE_LMHKMmJotRNCAwTBT4K8MWfyTJQ44oJvLGXQ5QleJnCRLOFQP9upbwUzNJ_s1d7Uk_OQmfIuq-J-IU9Ysp0x0g9dzitzW" />
      </div>
      <div className="p-6">
      <div className="flex justify-between items-start mb-4">
      <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Luxe Matte</h3>
      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">Premium</span>
      </div>
      <a className="w-full py-3 rounded-xl border border-white/10 hover:bg-primary hover:text-on-primary transition-all font-label-md text-label-md" href="/editor?new=1" role="button">Use Template</a>
      </div>
      </div>
      </div>
      </div>
      </section>
      {/* Features Bento Grid */}
      <section className="py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
      <h2 className="font-display-sm text-display-sm text-on-surface mb-4">Precision Engineering</h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">Advanced tools for the modern marketer who refuses to settle for average.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter h-auto md:h-[600px]">
      <div className="md:col-span-8 glass-panel rounded-[32px] p-10 flex flex-col justify-between group overflow-hidden relative">
      <div className="relative z-10">
      <span className="material-symbols-outlined text-primary text-5xl mb-6 group-hover:scale-110 transition-transform">aspect_ratio</span>
      <h3 className="font-headline-lg text-headline-lg text-on-surface mb-4">AI-Powered Resizing</h3>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md">Instantly adapt one creative for every social platform. Our AI intelligent-crops and repositions elements to maintain visual hierarchy across 30+ formats.</p>
      </div>
      <div className="absolute bottom-0 right-0 w-1/2 h-full hidden md:block opacity-30 group-hover:opacity-50 transition-opacity">
      <img alt="Analytics Feature" className="w-full h-full object-cover rounded-tl-[64px]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIHOzY5ca8EkRIRIMcRYi4vYyuoYwYrCGS92Mkhxmr5Xs1VSQBroQkiF_VidDCnNpMNVifBATTHZ2i1Flb3b719DguiRoxOEzTZyjy7-ghpTT-8oNLoq5N1JC0x9rAKq3M_0C1P5xISNkdMwfDMyvz4KYYI338xFRYXQxW4znpgSyPFVqZMV7GSgHFzOaf5eXqySfwcHra7JfzjSkyojSMHudXb04Tvs27Qg942GJiJ-GoFio1MAgX49APsjERvHDqG6HDcHMfEgHb" />
      </div>
      </div>
      <div className="md:col-span-4 glass-panel rounded-[32px] p-10 flex flex-col justify-center items-center text-center group border-tertiary/20">
      <span className="material-symbols-outlined text-tertiary text-5xl mb-6 group-hover:rotate-12 transition-transform">auto_fix_high</span>
      <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-4">One-Click Polish</h3>
      <p className="font-body-md text-body-md text-on-surface-variant">Apply global brand styles, color matching, and professional retouching with a single click.</p>
      </div>
      <div className="md:col-span-4 glass-panel rounded-[32px] p-10 group bg-primary-container/5 border-primary/20">
      <span className="material-symbols-outlined text-primary text-5xl mb-6">edit_square</span>
      <h4 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Drag-and-Drop Editor</h4>
      <p className="font-body-md text-body-md text-on-surface-variant">Pro-grade capabilities in a frictionless interface designed for speed.</p>
      </div>
      <div className="md:col-span-8 glass-panel rounded-[32px] p-10 flex items-center gap-8 group">
      <div className="flex-1">
      <span className="material-symbols-outlined text-secondary text-5xl mb-6">insights</span>
      <h4 className="font-headline-lg text-headline-lg text-on-surface mb-2">Real-time Analytics</h4>
      <p className="font-body-md text-body-md text-on-surface-variant">Predictive performance scoring before you even launch your campaign.</p>
      </div>
      <div className="hidden lg:flex gap-2">
      <div className="w-12 h-32 bg-primary/20 rounded-full flex items-end p-1">
      <div className="w-full bg-primary rounded-full h-3/4 animate-bounce"></div>
      </div>
      <div className="w-12 h-32 bg-primary/20 rounded-full flex items-end p-1">
      <div className="w-full bg-primary rounded-full h-1/2 animate-bounce [animation-delay:0.2s]"></div>
      </div>
      <div className="w-12 h-32 bg-primary/20 rounded-full flex items-end p-1">
      <div className="w-full bg-primary rounded-full h-full animate-bounce [animation-delay:0.4s]"></div>
      </div>
      </div>
      </div>
      </div>
      </div>
      </section>
      {/* Live Analytics Preview */}
      <section className="py-xl px-margin-mobile md:px-margin-desktop overflow-hidden">
      <div className="max-w-7xl mx-auto glass-panel rounded-[40px] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-16 relative">
      <div className="absolute top-0 right-0 w-full h-full bg-primary/5 blur-[120px] pointer-events-none"></div>
      <div className="flex-1 z-10">
      <h2 className="font-display-sm text-display-sm text-on-surface mb-6">Performance by Design</h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-10">Don't just create; optimize. Addvoxen's Live Analytics dashboard integrates directly with your ad managers to show CPM, CTR, and ROAS in a unified, beautiful view.</p>
      <button className="bg-on-surface text-surface font-label-md text-label-md px-10 py-4 rounded-xl hover:shadow-xl active:scale-95 transition-all">
                              View Demo
                          </button>
      </div>
      <div className="flex-1 w-full z-10">
      <div className="glass-panel p-6 rounded-3xl border-white/10 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
      <div className="flex gap-4">
      <div className="px-4 py-2 rounded-lg bg-white/5 font-label-sm text-label-sm">CTR: 4.82%</div>
      <div className="px-4 py-2 rounded-lg bg-white/5 font-label-sm text-label-sm">CPM: $12.40</div>
      </div>
      <div className="flex gap-2">
      <div className="w-2 h-2 rounded-full bg-primary"></div>
      <div className="w-2 h-2 rounded-full bg-tertiary"></div>
      </div>
      </div>
      {/* Simple Graph Mockup */}
      <div className="h-48 flex items-end gap-2 px-2">
      <div className="flex-1 bg-primary/20 rounded-t-lg h-[40%] hover:bg-primary transition-all"></div>
      <div className="flex-1 bg-primary/20 rounded-t-lg h-[65%] hover:bg-primary transition-all"></div>
      <div className="flex-1 bg-primary/20 rounded-t-lg h-[50%] hover:bg-primary transition-all"></div>
      <div className="flex-1 bg-primary/20 rounded-t-lg h-[85%] hover:bg-primary transition-all"></div>
      <div className="flex-1 bg-primary/20 rounded-t-lg h-[60%] hover:bg-primary transition-all"></div>
      <div className="flex-1 bg-primary/20 rounded-t-lg h-[95%] hover:bg-primary transition-all"></div>
      <div className="flex-1 bg-primary/20 rounded-t-lg h-[70%] hover:bg-primary transition-all"></div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between font-label-sm text-label-sm text-outline">
      <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
      </div>
      </div>
      </div>
      </div>
      </section>
      {/* Pricing Preview */}
      <section className="py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-lowest/30">
      <div className="max-w-7xl mx-auto text-center">
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-12">Scalable Solutions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter max-w-4xl mx-auto">
      {/* Starter */}
      <div className="glass-panel p-10 rounded-[32px] text-left hover:border-primary/30 transition-all">
      <p className="font-label-md text-label-md text-primary mb-2 uppercase tracking-wider">Starter</p>
      <h3 className="font-display-sm text-display-sm text-on-surface mb-6">$49<span className="text-on-surface-variant font-body-md">/mo</span></h3>
      <ul className="space-y-4 mb-10 text-on-surface-variant font-body-md">
      <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">check_circle</span> 50 AI Generations</li>
      <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">check_circle</span> Standard Templates</li>
      <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">check_circle</span> Basic Analytics</li>
      </ul>
      <button className="w-full py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all font-label-md text-label-md">Choose Starter</button>
      </div>
      {/* Pro */}
      <div className="glass-panel p-10 rounded-[32px] text-left border-primary/50 relative overflow-hidden group">
      <div className="ai-gradient absolute top-0 right-0 px-6 py-1 rounded-bl-xl font-label-sm text-label-sm text-on-primary">Most Popular</div>
      <p className="font-label-md text-label-md text-primary mb-2 uppercase tracking-wider">Pro</p>
      <h3 className="font-display-sm text-display-sm text-on-surface mb-6">$199<span className="text-on-surface-variant font-body-md">/mo</span></h3>
      <ul className="space-y-4 mb-10 text-on-surface-variant font-body-md">
      <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">check_circle</span> Unlimited Generations</li>
      <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">check_circle</span> Premium Bento Templates</li>
      <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">check_circle</span> Advanced Predictive AI</li>
      </ul>
      <button className="w-full py-4 rounded-xl ai-gradient text-on-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all font-label-md text-label-md">Choose Pro</button>
      </div>
      </div>
      </div>
      </section>
      {/* Testimonial */}
      <section className="py-xl px-margin-mobile md:px-margin-desktop">
      <div className="max-w-4xl mx-auto text-center glass-panel p-16 rounded-[40px] relative">
      <span className="material-symbols-outlined text-primary text-6xl opacity-20 absolute top-10 left-10">format_quote</span>
      <p className="font-display-sm text-display-sm italic text-on-surface mb-10 leading-tight">
                          "Addvoxen has transformed our creative workflow. We've seen a 40% increase in conversion rates while spending 80% less time on manual design tasks."
                      </p>
      <div className="flex flex-col items-center">
      <div className="w-20 h-20 rounded-full border-2 border-primary p-1 mb-4">
      <img alt="Founder" className="w-full h-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKevRcG_KSz4h14yA-KCkRgJGf77zOncTYAU3lhHCuERrNqrFLw3YzrS2JswMIjF-OB01Xmzwkq-kwMLq_ww-J6pW3T5-FofPvcJz3fgQsoEYlnGPVHDUBp8V-MuVAOhTyJ89PwF6vB9oNZu0W1RySVvBQSylUD36_38x2UvpTJHLG5peMklwpY3O8orI_J__HzsOj-fxhAzTK9VWJ63V-vYKFQbjplVPVFFgF7eRrEe53fM3CftiEv1EOX4qruxoUAwmWvaPP43A3" />
      </div>
      <h4 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Julian Thorne</h4>
      <p className="font-label-md text-label-md text-primary">Founder, Vortex Media</p>
      </div>
      </div>
      </section>
      </main>
      {/* The global SiteFooter (in src/app/layout.tsx) renders here — no
       *  per-page footer needed. */}
    </div>
  );
}
