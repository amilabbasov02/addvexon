"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Initial = {
  name: string;
  handle: string;
  bio: string;
  website: string;
  twitter: string;
};

export function ProfileForm({
  initial,
  ownerId,
}: {
  initial: Initial;
  ownerId: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof Initial>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data?.error ?? "Could not save");
      } else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Display name">
        <input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          maxLength={80}
          className="w-full bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary"
        />
      </Field>
      <Field
        label="Handle"
        hint="3–20 chars, a-z 0-9 _ only. Your profile lives at /u/{handle}."
      >
        <div className="flex items-center bg-surface-container-high/60 border border-white/10 rounded-lg px-3">
          <span className="text-on-surface-variant text-label-md font-label-md">@</span>
          <input
            value={form.handle}
            onChange={(e) => set("handle", e.target.value)}
            maxLength={20}
            className="flex-1 bg-transparent py-2 text-label-md font-label-md text-on-surface focus:outline-none"
          />
        </div>
      </Field>
      <Field label="Bio" hint={`${form.bio.length}/280`}>
        <textarea
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          maxLength={280}
          rows={3}
          className="w-full bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary resize-none"
        />
      </Field>
      <Field label="Website">
        <input
          type="url"
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
          maxLength={120}
          placeholder="https://your-site.com"
          className="w-full bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary"
        />
      </Field>
      <Field label="Twitter / X">
        <div className="flex items-center bg-surface-container-high/60 border border-white/10 rounded-lg px-3">
          <span className="text-on-surface-variant text-label-md font-label-md">@</span>
          <input
            value={form.twitter}
            onChange={(e) => set("twitter", e.target.value)}
            maxLength={30}
            className="flex-1 bg-transparent py-2 text-label-md font-label-md text-on-surface focus:outline-none"
          />
        </div>
      </Field>

      {error && (
        <p className="text-error text-label-sm font-label-sm">{error}</p>
      )}

      <div className="flex items-center gap-3 mt-2">
        <button
          type="submit"
          disabled={saving}
          className="ai-gradient text-on-primary px-6 py-2.5 rounded-full text-label-md font-label-md disabled:opacity-60"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>
        <Link
          href={`/u/${form.handle || ownerId}`}
          className="text-on-surface-variant hover:text-on-surface text-label-md font-label-md"
        >
          View profile
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-label-sm font-label-sm text-on-surface">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-on-surface-variant text-xs">{hint}</span>
      )}
    </label>
  );
}
