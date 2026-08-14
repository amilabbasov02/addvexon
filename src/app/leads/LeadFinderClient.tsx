"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  CATEGORY_LABELS,
  LEAD_CATEGORIES,
  type LeadCategory,
} from "@/lib/leads/providers/types";
import type { LeadSearch } from "@/db/schema";

/** Azerbaijan first — it is the default market for every other part of the app. */
const COUNTRIES = [
  { code: "AZ", name: "Azerbaijan", defaultCity: "Baku" },
  { code: "TR", name: "Türkiye", defaultCity: "Istanbul" },
  { code: "GE", name: "Georgia", defaultCity: "Tbilisi" },
];

export function LeadFinderClient({
  initialSearches,
}: {
  initialSearches: LeadSearch[];
}) {
  const router = useRouter();
  const [searches] = useState(initialSearches);
  const [open, setOpen] = useState(initialSearches.length === 0);

  const [country, setCountry] = useState("AZ");
  const [city, setCity] = useState("Baku");
  const [category, setCategory] = useState<LeadCategory>("beauty_salon");
  const [maxLeads, setMaxLeads] = useState(100);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startSearch() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, city, category, maxLeads }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start the search");
      router.push(`/leads/${data.searchId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-on-background sm:text-3xl">
            Lead Finder
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
            Find local businesses that need a website, score them by how likely
            they are to buy, and turn the best ones into demos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition-colors duration-200 hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {open ? "Close" : "New search"}
        </button>
      </header>

      {open && (
        <section className="mb-10 rounded-2xl border border-outline-variant bg-surface-container-low p-5 sm:p-6">
          <h2 className="mb-5 text-lg font-medium text-on-surface">
            Start a new search
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Country" htmlFor="country">
              <select
                id="country"
                value={country}
                onChange={(e) => {
                  const next = e.target.value;
                  setCountry(next);
                  const match = COUNTRIES.find((c) => c.code === next);
                  if (match) setCity(match.defaultCity);
                }}
                className={inputClass}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="City" htmlFor="city">
              <input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Baku"
                className={inputClass}
              />
            </Field>

            <Field label="Business category" htmlFor="category">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as LeadCategory)}
                className={inputClass}
              >
                {LEAD_CATEGORIES.map((key) => (
                  <option key={key} value={key}>
                    {CATEGORY_LABELS[key]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Maximum leads" htmlFor="maxLeads">
              <input
                id="maxLeads"
                type="number"
                min={1}
                max={300}
                value={maxLeads}
                onChange={(e) =>
                  setMaxLeads(Math.max(1, Math.min(300, Number(e.target.value) || 1)))
                }
                className={inputClass}
              />
            </Field>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={startSearch}
              disabled={submitting || city.trim().length < 2}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-on-primary transition-colors duration-200 hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Starting…" : "Start Lead Search"}
            </button>
            <p className="text-xs text-on-surface-variant">
              Runs in the background — usually a few minutes. You can leave this
              page.
            </p>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-medium text-on-surface">
          Recent searches
        </h2>

        {searches.length === 0 ? (
          <EmptyState onStart={() => setOpen(true)} />
        ) : (
          <ul className="grid gap-3">
            {searches.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/leads/${s.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4 transition-colors duration-200 hover:border-outline hover:bg-surface-container"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-on-surface">
                      {CATEGORY_LABELS[s.category as LeadCategory] ?? s.category}
                      <span className="text-on-surface-variant"> · {s.city}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">
                      {new Date(s.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-5">
                    {s.status === "completed" ? (
                      <div className="flex items-center gap-3 text-xs">
                        <Count value={s.highCount} label="High" tone="high" />
                        <Count value={s.mediumCount} label="Med" tone="medium" />
                        <Count value={s.lowCount} label="Low" tone="low" />
                      </div>
                    ) : null}
                    <StatusPill status={s.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 text-sm text-on-surface transition-colors duration-200 hover:border-outline focus:border-primary focus:outline-none";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-medium text-on-surface-variant"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Count({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "high" | "medium" | "low";
}) {
  const toneClass = {
    high: "text-tertiary",
    medium: "text-secondary",
    low: "text-on-surface-variant",
  }[tone];

  return (
    <span className={toneClass}>
      <span className="font-semibold">{value}</span>{" "}
      <span className="text-on-surface-variant">{label}</span>
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    queued: "bg-surface-container-high text-on-surface-variant",
    running: "bg-secondary-container text-on-secondary-container",
    completed: "bg-tertiary-container text-on-tertiary-container",
    failed: "bg-error-container text-on-error-container",
    cancelled: "bg-surface-container-high text-on-surface-variant",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${map[status] ?? map.queued}`}
    >
      {status}
    </span>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-12 text-center">
      <p className="text-on-surface">No searches yet</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-on-surface-variant">
        Pick a city and a business category, and Lead Finder will look for local
        businesses that don&apos;t have a decent website yet.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition-colors duration-200 hover:bg-primary-container"
      >
        Start your first search
      </button>
    </div>
  );
}
