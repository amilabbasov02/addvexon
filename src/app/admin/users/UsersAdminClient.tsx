"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRow } from "./page";

const PLANS = ["free", "pro", "team", "enterprise"] as const;

export function UsersAdminClient({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.email.toLowerCase().includes(q) ||
      (u.name?.toLowerCase().includes(q) ?? false)
    );
  });

  const changePlan = async (id: string, plan: string) => {
    setBusy(id);
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setPlan", plan }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by email or name…"
        className="glass-panel rounded-full px-4 py-2.5 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary border border-white/10 mb-4"
      />

      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-label-sm">
          <thead className="bg-surface-container-high/40 text-on-surface-variant text-[10px] uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Plan</th>
              <th className="text-left px-4 py-3">Joined</th>
              <th className="text-right px-4 py-3">Set plan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((u) => (
              <tr key={u.id} className="border-t border-white/5 hover:bg-white/3">
                <td className="px-4 py-3 text-on-surface">
                  {u.name ?? <span className="opacity-50">—</span>}
                  {u.emailVerified && (
                    <span
                      title="Email verified"
                      className="material-symbols-outlined text-tertiary text-[14px] ml-1 align-middle"
                    >
                      verified
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-on-surface-variant">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full " +
                      (u.plan === "free"
                        ? "bg-surface-container-high/60 text-on-surface-variant"
                        : "bg-primary text-on-primary")
                    }
                  >
                    {u.plan}
                  </span>
                </td>
                <td className="px-4 py-3 text-on-surface-variant text-xs">
                  {new Date(u.createdAt).toISOString().slice(0, 10)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    {PLANS.filter((p) => p !== u.plan).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => changePlan(u.id, p)}
                        disabled={busy === u.id}
                        className="text-label-sm text-on-surface-variant hover:text-on-surface px-2 py-1 capitalize disabled:opacity-50"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-on-surface-variant py-8">No users match.</p>
        )}
      </div>

      <p className="text-on-surface-variant text-xs mt-4">
        Showing {Math.min(filtered.length, 100)} of {users.length} users.
      </p>
    </>
  );
}
