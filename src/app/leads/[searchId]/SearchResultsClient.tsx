"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORY_LABELS, type LeadCategory } from "@/lib/leads/providers/types";
import { StatusPill } from "../LeadFinderClient";
import type { LeadSearch } from "@/db/schema";

type LeadRow = {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
  socials: { facebook?: string; instagram?: string; linkedin?: string } | null;
  score: number;
  band: string;
  scoreReasons: { rule: string; points: number; label: string }[] | null;
  status: string;
  contactedAt: string | null;
  sourceAttribution: string | null;
  reachable: boolean | null;
  issues: string[] | null;
  demoSubdomain: string | null;
};

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "addvoxen.com";

function demoUrl(subdomain: string): string {
  const protocol = ROOT_DOMAIN.includes("localhost") ? "http" : "https";
  return `${protocol}://${subdomain}.${ROOT_DOMAIN}`;
}

type JobState = {
  status: string;
  progress: number;
  step: string | null;
  error: string | null;
} | null;

type Filters = {
  band: string;
  website: string;
  hasContact: boolean;
  status: string;
  q: string;
};

const EMPTY_FILTERS: Filters = {
  band: "",
  website: "",
  hasContact: false,
  status: "",
  q: "",
};

export function SearchResultsClient({ search }: { search: LeadSearch }) {
  const [current, setCurrent] = useState(search);
  const [job, setJob] = useState<JobState>(null);
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [demoBusy, setDemoBusy] = useState<string | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);

  const isRunning = current.status === "queued" || current.status === "running";
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadLeads = useCallback(async () => {
    const params = new URLSearchParams({ searchId: current.id, limit: "200" });
    if (filters.band) params.set("band", filters.band);
    if (filters.website) params.set("website", filters.website);
    if (filters.hasContact) params.set("hasContact", "1");
    if (filters.status) params.set("status", filters.status);
    if (filters.q.trim()) params.set("q", filters.q.trim());

    const res = await fetch(`/api/leads?${params}`);
    if (!res.ok) return;
    const data = await res.json();
    setRows(data.leads ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [current.id, filters]);

  // Poll while the job is in flight, then stop. Polling a finished search
  // forever is the easiest way to make a dashboard feel expensive.
  useEffect(() => {
    if (!isRunning) return;

    async function tick() {
      const res = await fetch(`/api/leads/searches/${current.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setCurrent(data.search);
      setJob(data.job);
      if (data.search.status === "completed" || data.search.status === "failed") {
        if (pollRef.current) clearInterval(pollRef.current);
        void loadLeads();
      }
    }

    void tick();
    pollRef.current = setInterval(tick, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [current.id, isRunning, loadLeads]);

  useEffect(() => {
    if (isRunning) return;
    void loadLeads();
  }, [isRunning, loadLeads]);

  async function updateStatus(leadId: string, status: string) {
    // Optimistic: the row moves immediately, and a failure re-syncs from server.
    setRows((prev) =>
      prev.map((r) => (r.id === leadId ? { ...r, status } : r)),
    );
    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) void loadLeads();
  }

  async function generateDemo(leadId: string) {
    setDemoBusy(leadId);
    setDemoError(null);
    try {
      const res = await fetch(`/api/leads/${leadId}/demo`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate the demo");
      setRows((prev) =>
        prev.map((r) =>
          r.id === leadId ? { ...r, demoSubdomain: data.demo.subdomain } : r,
        ),
      );
    } catch (err) {
      setDemoError(
        err instanceof Error ? err.message : "Could not generate the demo",
      );
    } finally {
      setDemoBusy(null);
    }
  }

  const categoryLabel =
    CATEGORY_LABELS[current.category as LeadCategory] ?? current.category;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6">
        <Link
          href="/leads"
          className="text-sm text-on-surface-variant transition-colors duration-200 hover:text-on-surface"
        >
          ← All searches
        </Link>
      </nav>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-on-background sm:text-3xl">
            {categoryLabel} · {current.city}
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {new Date(current.createdAt).toLocaleString()} · up to{" "}
            {current.maxLeads} leads
          </p>
        </div>
        <StatusPill status={current.status} />
      </header>

      {isRunning && <ProgressPanel job={job} />}

      {current.status === "failed" && (
        <div
          role="alert"
          className="mb-8 rounded-xl bg-error-container px-5 py-4 text-sm text-on-error-container"
        >
          <p className="font-medium">This search failed</p>
          <p className="mt-1 opacity-90">
            {current.error ?? "No further detail was recorded."}
          </p>
        </div>
      )}

      {current.status === "completed" && (
        <>
          <SummaryCards search={current} />

          <FilterBar
            filters={filters}
            onChange={setFilters}
            showing={rows.length}
            total={total}
          />

          {demoError && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container"
            >
              {demoError}
            </p>
          )}

          {loading ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <NoResults hasFilters={filters !== EMPTY_FILTERS} />
          ) : (
            <ResultsTable
              rows={rows}
              expanded={expanded}
              onToggle={(id) => setExpanded(expanded === id ? null : id)}
              onStatus={updateStatus}
              onGenerateDemo={generateDemo}
              demoBusy={demoBusy}
            />
          )}

          <Attribution rows={rows} />
        </>
      )}
    </main>
  );
}

function ProgressPanel({ job }: { job: JobState }) {
  const progress = job?.progress ?? 0;
  const step = job?.step ?? "Starting…";

  return (
    <section className="mb-8 rounded-2xl border border-outline-variant bg-surface-container-low p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-on-surface">{step}</p>
        <p className="text-sm tabular-nums text-on-surface-variant">
          {progress}%
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Search progress"
        className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-on-surface-variant">
        This runs in the background — you can close the page and come back.
      </p>
    </section>
  );
}

function SummaryCards({ search }: { search: LeadSearch }) {
  const cards = [
    { label: "Businesses found", value: search.totalFound, tone: "text-on-surface" },
    { label: "High Potential", value: search.highCount, tone: "text-tertiary" },
    { label: "Medium Potential", value: search.mediumCount, tone: "text-secondary" },
    { label: "Low Potential", value: search.lowCount, tone: "text-on-surface-variant" },
  ];

  return (
    <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4"
        >
          <p className={`text-2xl font-semibold tabular-nums ${c.tone}`}>
            {c.value}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">{c.label}</p>
        </div>
      ))}
    </section>
  );
}

function FilterBar({
  filters,
  onChange,
  showing,
  total,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  showing: number;
  total: number;
}) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <section className="mb-4 flex flex-wrap items-center gap-3">
      <input
        value={filters.q}
        onChange={(e) => set("q", e.target.value)}
        placeholder="Search by name…"
        aria-label="Search leads by name"
        className="min-w-[12rem] flex-1 rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface transition-colors duration-200 hover:border-outline focus:border-primary focus:outline-none"
      />

      <select
        value={filters.band}
        onChange={(e) => set("band", e.target.value)}
        aria-label="Filter by potential"
        className={filterClass}
      >
        <option value="">All potential</option>
        <option value="high">High only</option>
        <option value="medium">Medium only</option>
        <option value="low">Low only</option>
      </select>

      <select
        value={filters.website}
        onChange={(e) => set("website", e.target.value)}
        aria-label="Filter by website"
        className={filterClass}
      >
        <option value="">Any website status</option>
        <option value="none">No website</option>
        <option value="has">Has website</option>
      </select>

      <select
        value={filters.status}
        onChange={(e) => set("status", e.target.value)}
        aria-label="Filter by lead status"
        className={filterClass}
      >
        <option value="">Any status</option>
        <option value="new">Not contacted</option>
        <option value="contacted">Contacted</option>
        <option value="replied">Replied</option>
        <option value="archived">Archived</option>
      </select>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant">
        <input
          type="checkbox"
          checked={filters.hasContact}
          onChange={(e) => set("hasContact", e.target.checked)}
          className="h-4 w-4 cursor-pointer accent-[var(--color-primary)]"
        />
        Has contact info
      </label>

      <p className="ml-auto text-xs tabular-nums text-on-surface-variant">
        Showing {showing} of {total}
      </p>
    </section>
  );
}

const filterClass =
  "cursor-pointer rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface transition-colors duration-200 hover:border-outline focus:border-primary focus:outline-none";

function ResultsTable({
  rows,
  expanded,
  onToggle,
  onStatus,
  onGenerateDemo,
  demoBusy,
}: {
  rows: LeadRow[];
  expanded: string | null;
  onToggle: (id: string) => void;
  onStatus: (id: string, status: string) => void;
  onGenerateDemo: (id: string) => void;
  demoBusy: string | null;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-outline-variant">
      <table className="w-full min-w-[56rem] border-collapse text-sm">
        <thead>
          <tr className="bg-surface-container text-left text-xs uppercase tracking-wide text-on-surface-variant">
            <th className="px-4 py-3 font-medium">Business</th>
            <th className="px-4 py-3 font-medium">Website</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Social</th>
            <th className="px-4 py-3 text-right font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((lead) => (
            <LeadRowView
              key={lead.id}
              lead={lead}
              expanded={expanded === lead.id}
              onToggle={() => onToggle(lead.id)}
              onStatus={onStatus}
              onGenerateDemo={onGenerateDemo}
              demoBusy={demoBusy === lead.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeadRowView({
  lead,
  expanded,
  onToggle,
  onStatus,
  onGenerateDemo,
  demoBusy,
}: {
  lead: LeadRow;
  expanded: boolean;
  onToggle: () => void;
  onStatus: (id: string, status: string) => void;
  onGenerateDemo: (id: string) => void;
  demoBusy: boolean;
}) {
  const socialCount = lead.socials
    ? [lead.socials.facebook, lead.socials.instagram, lead.socials.linkedin].filter(
        Boolean,
      ).length
    : 0;

  return (
    <>
      <tr className="border-t border-outline-variant bg-surface-container-lowest transition-colors duration-200 hover:bg-surface-container-low">
        <td className="px-4 py-3">
          <p className="font-medium text-on-surface">{lead.name}</p>
          {lead.address && (
            <p className="mt-0.5 text-xs text-on-surface-variant">{lead.address}</p>
          )}
        </td>

        <td className="px-4 py-3">
          {!lead.websiteUrl ? (
            <span className="rounded-full bg-tertiary-container px-2.5 py-1 text-xs font-medium text-on-tertiary-container">
              None
            </span>
          ) : lead.reachable === false ? (
            <span className="rounded-full bg-error-container px-2.5 py-1 text-xs font-medium text-on-error-container">
              Broken
            </span>
          ) : (lead.issues?.length ?? 0) > 0 ? (
            <span className="rounded-full bg-secondary-container px-2.5 py-1 text-xs font-medium text-on-secondary-container">
              {lead.issues!.length} issue{lead.issues!.length === 1 ? "" : "s"}
            </span>
          ) : (
            <span className="text-xs text-on-surface-variant">OK</span>
          )}
        </td>

        <td className="px-4 py-3 text-xs text-on-surface-variant">
          {lead.phone && <div>{lead.phone}</div>}
          {lead.email && <div className="truncate">{lead.email}</div>}
          {!lead.phone && !lead.email && <span>—</span>}
        </td>

        <td className="px-4 py-3 text-xs text-on-surface-variant">
          {socialCount > 0 ? `${socialCount}` : "—"}
        </td>

        <td className="px-4 py-3 text-right">
          <ScoreBadge score={lead.score} band={lead.band} />
        </td>

        <td className="px-4 py-3">
          <span className="text-xs capitalize text-on-surface-variant">
            {lead.status.replace(/_/g, " ")}
          </span>
        </td>

        <td className="px-4 py-3">
          <div className="flex justify-end gap-1">
            <RowButton onClick={onToggle}>
              {expanded ? "Hide" : "Details"}
            </RowButton>

            {lead.demoSubdomain ? (
              <a
                href={demoUrl(lead.demoSubdomain)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors duration-200 hover:bg-surface-container-high"
              >
                View demo
              </a>
            ) : (
              <RowButton
                onClick={() => onGenerateDemo(lead.id)}
                disabled={demoBusy}
              >
                {demoBusy ? "Building…" : "Generate demo"}
              </RowButton>
            )}

            {lead.status !== "contacted" && (
              <RowButton onClick={() => onStatus(lead.id, "contacted")}>
                Contacted
              </RowButton>
            )}
            {lead.status !== "archived" && (
              <RowButton onClick={() => onStatus(lead.id, "archived")}>
                Archive
              </RowButton>
            )}
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="border-t border-outline-variant bg-surface-container-low">
          <td colSpan={7} className="px-4 py-5">
            <LeadDetails lead={lead} />
            <OutreachPanel lead={lead} />
          </td>
        </tr>
      )}
    </>
  );
}

function LeadDetails({ lead }: { lead: LeadRow }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
          Why this is a potential customer
        </h3>
        {lead.scoreReasons?.length ? (
          <ul className="space-y-1.5">
            {lead.scoreReasons.map((r) => (
              <li key={r.rule} className="flex gap-2 text-sm text-on-surface">
                <span className="tabular-nums text-tertiary">+{r.points}</span>
                <span>{r.label}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-on-surface-variant">No signals recorded.</p>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
          Website
        </h3>
        {lead.websiteUrl ? (
          <>
            <a
              href={lead.websiteUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="block truncate text-sm text-primary underline-offset-4 hover:underline"
            >
              {lead.websiteUrl}
            </a>
            {lead.issues?.length ? (
              <ul className="mt-2 space-y-1">
                {lead.issues.map((issue) => (
                  <li key={issue} className="text-sm text-on-surface-variant">
                    · {issue}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-on-surface-variant">
                No obvious problems found.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-on-surface-variant">
            No website found — the strongest buying signal there is.
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
          Contact
        </h3>
        <dl className="space-y-1 text-sm">
          {lead.phone && (
            <div className="flex gap-2">
              <dt className="text-on-surface-variant">Phone</dt>
              <dd className="text-on-surface">{lead.phone}</dd>
            </div>
          )}
          {lead.email && (
            <div className="flex gap-2">
              <dt className="text-on-surface-variant">Email</dt>
              <dd className="truncate text-on-surface">{lead.email}</dd>
            </div>
          )}
          {lead.socials?.instagram && (
            <div className="flex gap-2">
              <dt className="text-on-surface-variant">Instagram</dt>
              <dd className="truncate">
                <a
                  href={lead.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Profile
                </a>
              </dd>
            </div>
          )}
          {lead.socials?.facebook && (
            <div className="flex gap-2">
              <dt className="text-on-surface-variant">Facebook</dt>
              <dd className="truncate">
                <a
                  href={lead.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Profile
                </a>
              </dd>
            </div>
          )}
          {!lead.phone && !lead.email && !lead.socials && (
            <p className="text-on-surface-variant">
              No public contact details found.
            </p>
          )}
        </dl>
      </div>
    </div>
  );
}

type Variant = { variant: number; label: string; subject: string; body: string };

/**
 * Draft, review and send outreach for one lead.
 *
 * Generation and sending are two explicit steps — nothing is ever sent from a
 * single click, and the copy is fully visible and editable before it goes.
 */
function OutreachPanel({ lead }: { lead: LeadRow }) {
  const [variants, setVariants] = useState<Variant[] | null>(null);
  const [chosen, setChosen] = useState(1);
  const [locale, setLocale] = useState<"az" | "en">("az");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "generate" | "save" | "send">(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function generate() {
    setBusy("generate");
    setError(null);
    try {
      const res = await fetch(`/api/leads/${lead.id}/outreach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate a message");
      setVariants(data.variants);
      const first = data.variants[0] as Variant;
      setChosen(first.variant);
      setSubject(first.subject);
      setBody(first.body);
      setSavedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  function pick(v: Variant) {
    setChosen(v.variant);
    setSubject(v.subject);
    setBody(v.body);
    setSavedId(null);
  }

  async function saveDraft(): Promise<string | null> {
    const res = await fetch(`/api/leads/${lead.id}/outreach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, variant: chosen }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Could not save the draft");
    setSavedId(data.message.id);
    return data.message.id;
  }

  async function send() {
    setBusy("send");
    setError(null);
    try {
      const id = savedId ?? (await saveDraft());
      if (!id) throw new Error("Could not save the draft");

      const res = await fetch(`/api/leads/${lead.id}/outreach/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outreachMessageId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send the email");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mt-6 border-t border-outline-variant pt-5">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
          Outreach
        </h3>

        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as "az" | "en")}
          aria-label="Message language"
          className="rounded-lg border border-outline-variant bg-surface-container px-2 py-1 text-xs text-on-surface"
        >
          <option value="az">Azərbaycanca</option>
          <option value="en">English</option>
        </select>

        <RowButton onClick={generate} disabled={busy !== null}>
          {busy === "generate" ? "Writing…" : variants ? "Regenerate" : "Generate message"}
        </RowButton>

        {!lead.email && (
          <span className="text-xs text-on-surface-variant">
            No email address — you can still draft and copy the text
          </span>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg bg-error-container px-3 py-2 text-xs text-on-error-container"
        >
          {error}
        </p>
      )}

      {sent && (
        <p className="mb-3 rounded-lg bg-tertiary-container px-3 py-2 text-xs text-on-tertiary-container">
          Sent to {lead.email}. The lead is now marked as contacted.
        </p>
      )}

      {variants && !sent && (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.variant}
                type="button"
                onClick={() => pick(v)}
                className={`rounded-full px-3 py-1 text-xs transition-colors duration-200 ${
                  chosen === v.variant
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <label className="mb-1 block text-xs text-on-surface-variant" htmlFor={`subj-${lead.id}`}>
            Subject
          </label>
          <input
            id={`subj-${lead.id}`}
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setSavedId(null);
            }}
            className="mb-3 w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
          />

          <label className="mb-1 block text-xs text-on-surface-variant" htmlFor={`body-${lead.id}`}>
            Message
          </label>
          <textarea
            id={`body-${lead.id}`}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setSavedId(null);
            }}
            rows={12}
            className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 font-mono text-xs leading-relaxed text-on-surface focus:border-primary focus:outline-none"
          />

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={send}
              disabled={busy !== null || !lead.email}
              className="rounded-full bg-primary px-5 py-2 text-xs font-medium text-on-primary transition-colors duration-200 hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "send" ? "Sending…" : "Send email"}
            </button>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(`${subject}\n\n${body}`)}
              className="rounded-full border border-outline-variant px-4 py-2 text-xs text-on-surface-variant transition-colors duration-200 hover:text-on-surface"
            >
              Copy
            </button>
            <p className="text-xs text-on-surface-variant">
              Every message carries a working opt-out link.
            </p>
          </div>
        </>
      )}
    </section>
  );
}

function ScoreBadge({ score, band }: { score: number; band: string }) {
  const tone =
    band === "high"
      ? "bg-tertiary-container text-on-tertiary-container"
      : band === "medium"
        ? "bg-secondary-container text-on-secondary-container"
        : "bg-surface-container-high text-on-surface-variant";

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${tone}`}
      title={`${band} potential`}
    >
      {score}
    </span>
  );
}

function RowButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg px-2.5 py-1.5 text-xs text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2" aria-label="Loading results" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-14 animate-pulse rounded-xl bg-surface-container-low"
        />
      ))}
    </div>
  );
}

function NoResults({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-outline-variant px-6 py-12 text-center">
      <p className="text-on-surface">
        {hasFilters ? "No leads match these filters" : "No businesses found"}
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-on-surface-variant">
        {hasFilters
          ? "Try widening the filters — start by clearing the potential and website filters."
          : "The map data for this city and category may be thin. Try a broader category or a larger city."}
      </p>
    </div>
  );
}

/** Data licences require attribution to be shown wherever the data is. */
function Attribution({ rows }: { rows: LeadRow[] }) {
  const sources = [
    ...new Set(rows.map((r) => r.sourceAttribution).filter(Boolean)),
  ];
  if (sources.length === 0) return null;

  return (
    <p className="mt-6 text-xs text-on-surface-variant">
      Business data: {sources.join(" · ")}
    </p>
  );
}
