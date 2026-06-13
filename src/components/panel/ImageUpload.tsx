"use client";

import { useRef, useState } from "react";

/**
 * Şəkil yükləmə sahəsi — logo və sayt şəkilləri üçün. Faylı /api/panel/upload-a
 * göndərir, qaytarılan URL-i onChange ilə verir. Önizləmə + yükləmə vəziyyəti.
 */
export function ImageUpload({
  label,
  value,
  onChange,
  hint,
  rounded = false,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  rounded?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/panel/upload", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error ?? "Yükləmə xətası");
      onChange(j.url as string);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xəta");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-4">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-50 ${rounded ? "rounded-full" : "rounded-xl"}`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-slate-300">image</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-base">upload</span>
              {busy ? "Yüklənir…" : "Şəkil yüklə"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sil
              </button>
            )}
          </div>
          {hint && <span className="text-xs text-slate-400">{hint}</span>}
          {err && <span className="text-xs text-red-600">{err}</span>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
