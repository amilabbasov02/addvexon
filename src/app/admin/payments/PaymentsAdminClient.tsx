"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  id: string;
  reference: string;
  plan: string;
  billing: string;
  amountCents: number;
  currency: string;
  country: string;
  provider: string;
  status: string;
  paidAt: string | null;
  createdAt: string | null;
  userId: string;
  userEmail: string | null;
  userName: string | null;
};

export function PaymentsAdminClient({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmIntent = async (id: string, action: "paid" | "failed" | "cancelled") => {
    setBusyId(id);
    setError(null);
    try {
      const r = await fetch(`/api/billing/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data?.error ?? "Failed");
      } else {
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  const fmt = (cents: number, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
        cents / 100,
      );
    } catch {
      return `${(cents / 100).toFixed(2)} ${currency}`;
    }
  };

  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16">
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8">
          <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
            Admin
          </p>
          <h1 className="font-display-sm text-display-sm font-bold text-on-surface">
            Payments
          </h1>
          <p className="text-on-surface-variant text-body-md font-body-md mt-2">
            Confirm bank transfers, mark failed intents, refund mistakes.
            Approval upgrades the user&apos;s plan automatically.
          </p>
        </header>

        {error && (
          <p className="text-error text-label-sm font-label-sm mb-4">{error}</p>
        )}

        {rows.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center text-on-surface-variant">
            No payment intents yet.
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden">
            <table className="w-full text-label-sm font-label-sm">
              <thead className="bg-surface-container-high/50 border-b border-white/10">
                <tr>
                  <th className="text-left p-3 text-on-surface-variant">Reference</th>
                  <th className="text-left p-3 text-on-surface-variant">User</th>
                  <th className="text-left p-3 text-on-surface-variant">Plan</th>
                  <th className="text-right p-3 text-on-surface-variant">Amount</th>
                  <th className="text-left p-3 text-on-surface-variant">Country / Provider</th>
                  <th className="text-left p-3 text-on-surface-variant">Status</th>
                  <th className="text-right p-3 text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="p-3 font-mono text-on-surface">
                      {r.reference}
                    </td>
                    <td className="p-3 text-on-surface">
                      <p className="truncate max-w-[180px]">{r.userName ?? "—"}</p>
                      <p className="text-on-surface-variant text-xs truncate max-w-[180px]">
                        {r.userEmail ?? "—"}
                      </p>
                    </td>
                    <td className="p-3 text-on-surface">
                      {r.plan} · {r.billing}
                    </td>
                    <td className="p-3 text-right text-on-surface">
                      {fmt(r.amountCents, r.currency)}
                    </td>
                    <td className="p-3 text-on-surface-variant">
                      <p>{r.country}</p>
                      <p className="text-xs">{r.provider}</p>
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full " +
                          (r.status === "paid"
                            ? "bg-tertiary text-on-tertiary"
                            : r.status === "pending"
                              ? "ai-gradient text-on-primary"
                              : "bg-error-container/40 text-error")
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {r.status === "pending" ? (
                        <div className="inline-flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => confirmIntent(r.id, "paid")}
                            disabled={busyId === r.id}
                            className="ai-gradient text-on-primary px-3 py-1.5 rounded-full text-xs font-bold disabled:opacity-60"
                          >
                            Mark paid
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmIntent(r.id, "cancelled")}
                            disabled={busyId === r.id}
                            className="glass-panel px-3 py-1.5 rounded-full text-xs text-on-surface-variant hover:text-on-surface"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant text-xs">
                          {r.paidAt
                            ? new Date(r.paidAt).toLocaleDateString()
                            : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
