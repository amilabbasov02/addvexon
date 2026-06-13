"use client";

/** addvoxen platforması üçün dil keçidi (AZ/RU/EN). Cookie-yə yazır + reload. */
import { PLANGS, PLANG_LABELS, PLANG_COOKIE, type PLang } from "@/lib/platform-i18n";

export function PlatformLangSwitcher({ current }: { current: PLang }) {
  function choose(l: PLang) {
    if (l === current) return;
    document.cookie = `${PLANG_COOKIE}=${l}; path=/; max-age=31536000`;
    window.location.reload();
  }
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-white p-0.5">
      {PLANGS.map((l) => (
        <button
          key={l}
          onClick={() => choose(l)}
          aria-current={l === current}
          className={"rounded-full px-2 py-1 text-xs font-bold transition-colors " + (l === current ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900")}
        >
          {PLANG_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
