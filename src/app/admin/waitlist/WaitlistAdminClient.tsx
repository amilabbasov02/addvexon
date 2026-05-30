"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { WaitlistEntry } from "./page";

const FILTERS = [
  { id: "all", label: "All", icon: "groups" },
  { id: "pending", label: "Uncontacted", icon: "schedule" },
  { id: "contacted", label: "Contacted", icon: "outgoing_mail" },
  { id: "converted", label: "Converted", icon: "check_circle" },
];

export function WaitlistAdminClient({ entries }: { entries: WaitlistEntry[] }) {
  const router = useRouter();
  const search = useSearchParams();
  const filter = search.get("filter") ?? "all";

  const counts = useMemo(() => {
    return {
      all: entries.length,
      pending: entries.filter((e) => !e.contactedAt).length,
      contacted: entries.filter((e) => e.contactedAt && !e.convertedAt).length,
      converted: entries.filter((e) => !!e.convertedAt).length,
    } as Record<string, number>;
  }, [entries]);

  const visible = entries.filter((e) => {
    if (filter === "pending") return !e.contactedAt;
    if (filter === "contacted") return !!e.contactedAt && !e.convertedAt;
    if (filter === "converted") return !!e.convertedAt;
    return true;
  });

  const markAction = async (id: string, action: "contacted" | "converted") => {
    await fetch(`/api/admin/waitlist/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => router.replace(`/admin/waitlist?filter=${f.id}`)}
            className={
              "px-4 py-2 rounded-full text-label-sm font-label-sm flex items-center gap-2 transition-colors " +
              (filter === f.id
                ? "bg-primary text-on-primary"
                : "glass-panel text-on-surface-variant hover:text-on-surface")
            }
          >
            <span className="material-symbols-outlined text-[16px]">{f.icon}</span>
            {f.label}
            <span className="text-[10px] font-bold opacity-70">
              {counts[f.id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="glass-panel rounded-2xl p-10 text-center text-on-surface-variant">
          No entries.
        </p>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
          <table className="w-full text-label-sm">
            <thead className="bg-surface-container-high/40 text-on-surface-variant text-[10px] uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Notes</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((e) => {
                const status = e.convertedAt
                  ? "converted"
                  : e.contactedAt
                    ? "contacted"
                    : "pending";
                return (
                  <tr
                    key={e.id}
                    className="border-t border-white/5 hover:bg-white/3"
                  >
                    <td className="px-4 py-3 text-on-surface">
                      <a
                        href={`mailto:${e.email}`}
                        className="hover:text-tertiary-fixed-dim hover:underline"
                      >
                        {e.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {e.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 capitalize text-tertiary-fixed-dim font-bold">
                      {e.plan}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {e.company ?? "—"}
                      {e.teamSize && <span className="opacity-60"> ({e.teamSize})</span>}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant max-w-xs truncate">
                      {e.notes ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">
                      {e.createdAt.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full " +
                          (status === "converted"
                            ? "bg-tertiary/20 text-tertiary"
                            : status === "contacted"
                              ? "bg-primary-container/30 text-primary-fixed-dim"
                              : "bg-warn/20 text-warn")
                        }
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {status === "pending" && (
                          <button
                            type="button"
                            onClick={() => markAction(e.id, "contacted")}
                            className="text-label-sm text-on-surface-variant hover:text-on-surface px-2 py-1"
                          >
                            Mark contacted
                          </button>
                        )}
                        {status !== "converted" && (
                          <button
                            type="button"
                            onClick={() => markAction(e.id, "converted")}
                            className="text-label-sm text-tertiary-fixed-dim hover:text-tertiary px-2 py-1"
                          >
                            Mark converted
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-on-surface-variant text-xs mt-4">
        For automation, use{" "}
        <code className="text-on-surface">
          npx tsx scripts/admin-upgrade-user.ts &lt;email&gt; pro
        </code>{" "}
        — that upgrades a signed-up user's plan and stamps the waitlist row converted.
      </p>
    </>
  );
}
