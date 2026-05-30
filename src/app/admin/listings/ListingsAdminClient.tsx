"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DocumentThumbnail } from "@/components/dashboard/DocumentThumbnail";
import type { Listing } from "./page";

const STATUS_PILLS = [
  { id: "pending", label: "Pending", icon: "rate_review" },
  { id: "approved", label: "Approved", icon: "check_circle" },
  { id: "rejected", label: "Rejected", icon: "block" },
];

function fmtMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function ListingsAdminClient({ listings }: { listings: Listing[] }) {
  const router = useRouter();
  const search = useSearchParams();
  const status = search.get("status") ?? "pending";

  const counts = useMemo(() => {
    return {
      pending: listings.filter((l) => l.listingStatus === "pending").length,
      approved: listings.filter((l) => l.listingStatus === "approved").length,
      rejected: listings.filter((l) => l.listingStatus === "rejected").length,
    } as Record<string, number>;
  }, [listings]);

  const filtered = listings.filter((l) => l.listingStatus === status);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_PILLS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => router.replace(`/admin/listings?status=${p.id}`)}
            className={
              "px-4 py-2 rounded-full text-label-sm font-label-sm flex items-center gap-2 transition-colors " +
              (status === p.id
                ? "bg-primary text-on-primary"
                : "glass-panel text-on-surface-variant hover:text-on-surface")
            }
          >
            <span className="material-symbols-outlined text-[16px]">{p.icon}</span>
            {p.label}
            <span className="text-[10px] font-bold opacity-70">
              {counts[p.id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="glass-panel rounded-2xl p-10 text-center text-on-surface-variant">
          No {status} listings.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((l) => (
            <ListingRow key={l.id} listing={l} />
          ))}
        </div>
      )}
    </>
  );
}

function ListingRow({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [reasonOpen, setReasonOpen] = useState<"reject" | "takedown" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const act = async (
    action: "approve" | "reject" | "takedown",
    reasonText?: string,
  ) => {
    setBusy(action);
    setError(null);
    try {
      const r = await fetch(`/api/admin/listings/${listing.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reasonText }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        setError(data.error ?? "Failed");
        return;
      }
      setReasonOpen(null);
      setReason("");
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
      <div className="flex">
        {/* Thumbnail */}
        <div className="w-40 shrink-0 bg-surface-container-lowest border-r border-white/10 flex items-center justify-center">
          <div
            className="w-full h-full"
            style={{
              aspectRatio: `${listing.document.canvasSize.width} / ${listing.document.canvasSize.height}`,
              maxHeight: 200,
            }}
          >
            <DocumentThumbnail
              background={listing.document.background}
              canvasSize={listing.document.canvasSize}
              layers={listing.document.layers}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="text-on-surface font-label-md text-label-md truncate">
                {listing.name}
              </p>
              <p className="text-on-surface-variant text-label-sm font-label-sm truncate">
                {listing.category} ·{" "}
                {listing.document.canvasSize.width}×
                {listing.document.canvasSize.height} ·{" "}
                <span className="text-tertiary-fixed-dim font-bold">
                  {fmtMoney(listing.priceCents)}
                </span>
              </p>
            </div>
          </div>

          {listing.tagline && (
            <p className="text-on-surface-variant text-label-sm font-label-sm mb-2 line-clamp-2">
              {listing.tagline}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-3">
            <span className="material-symbols-outlined text-[14px]">
              person
            </span>
            <span className="truncate">
              {listing.creatorName ?? "Unknown"}
              {listing.creatorEmail && (
                <span className="text-on-surface-variant/60">
                  {" "}
                  · {listing.creatorEmail}
                </span>
              )}
            </span>
          </div>

          {listing.listingStatus === "approved" && (
            <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-3">
              <span>
                <strong className="text-on-surface">
                  {listing.salesCount}
                </strong>{" "}
                sales
              </span>
              <span>
                <strong className="text-on-surface">
                  {fmtMoney(listing.revenueCents)}
                </strong>{" "}
                revenue
              </span>
              <span>
                <strong className="text-on-surface">{listing.downloads}</strong>{" "}
                downloads
              </span>
            </div>
          )}

          {error && (
            <p className="text-error text-label-sm font-label-sm bg-error-container/15 border border-error/20 rounded-lg px-2 py-1 mb-2">
              {error}
            </p>
          )}

          {/* Actions */}
          {reasonOpen ? (
            <div className="space-y-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder={`Reason (sent to creator via email)`}
                className="bg-surface-container-high/60 border border-white/10 rounded-md px-2 py-1.5 text-on-surface focus:outline-none focus:border-primary text-label-sm"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => act(reasonOpen, reason)}
                  disabled={busy !== null}
                  className={
                    "px-3 py-1.5 rounded-full text-label-sm font-label-sm transition-all " +
                    (reasonOpen === "takedown"
                      ? "bg-error text-on-error"
                      : "bg-warn text-surface")
                  }
                >
                  {busy ? "Sending…" : reasonOpen === "takedown" ? "Take it down" : "Reject"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReasonOpen(null);
                    setReason("");
                  }}
                  className="text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface px-3 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {listing.listingStatus === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => act("approve")}
                    disabled={busy !== null}
                    className="bg-tertiary text-on-tertiary px-4 py-1.5 rounded-full text-label-sm font-label-sm flex items-center gap-1 disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      check
                    </span>
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setReasonOpen("reject")}
                    disabled={busy !== null}
                    className="bg-warn/20 text-warn border border-warn/30 px-4 py-1.5 rounded-full text-label-sm font-label-sm flex items-center gap-1 disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      block
                    </span>
                    Reject
                  </button>
                </>
              )}
              {listing.listingStatus === "approved" && (
                <button
                  type="button"
                  onClick={() => setReasonOpen("takedown")}
                  disabled={busy !== null}
                  className="bg-error-container/20 text-error border border-error/30 px-4 py-1.5 rounded-full text-label-sm font-label-sm flex items-center gap-1 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    remove_circle
                  </span>
                  Take down
                </button>
              )}
              <a
                href={`/editor?template=${listing.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded-full hover:bg-white/5 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  open_in_new
                </span>
                Preview
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
