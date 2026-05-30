"use client";

import { useState } from "react";

export function SupportForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const country =
        (typeof window !== "undefined" &&
          localStorage.getItem("addvoxen.country")) ||
        null;
      const r = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, body, country }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data?.error ?? "Could not send. Try again.");
      } else {
        setSent(data.id);
        setName("");
        setEmail("");
        setSubject("");
        setBody("");
      }
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl ai-gradient flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-on-primary text-2xl">
            check
          </span>
        </div>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
          Message received
        </h2>
        <p className="text-on-surface-variant text-body-md font-body-md">
          Ticket{" "}
          <code className="bg-surface-container-high/60 px-1.5 py-0.5 rounded text-on-surface text-label-sm">
            {sent}
          </code>
          {" "}— we&apos;ll get back to you at the email you provided.
        </p>
        <button
          type="button"
          onClick={() => setSent(null)}
          className="mt-5 glass-panel px-5 py-2 rounded-full text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="glass-panel rounded-3xl p-6 flex flex-col gap-4 border border-white/10"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Your name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="w-full bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={200}
            className="w-full bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary"
          />
        </Field>
      </div>
      <Field label="Subject">
        <input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          className="w-full bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary"
        />
      </Field>
      <Field label="Message" hint={`${body.length}/5000`}>
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={5000}
          rows={6}
          className="w-full bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary resize-none"
        />
      </Field>
      {error && (
        <p className="text-error text-label-sm font-label-sm">{error}</p>
      )}
      <div className="flex items-center justify-between">
        <p className="text-on-surface-variant text-label-sm font-label-sm">
          Delivered to support@addvoxen.com
        </p>
        <button
          type="submit"
          disabled={busy}
          className="ai-gradient text-on-primary px-6 py-2.5 rounded-full text-label-md font-label-md disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send"}
        </button>
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
        <span className="text-on-surface-variant text-xs self-end">{hint}</span>
      )}
    </label>
  );
}
