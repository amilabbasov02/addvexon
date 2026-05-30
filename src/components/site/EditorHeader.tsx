"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type SyncStatus =
  | "idle"
  | "saving"
  | "saved"
  | "error"
  | "loading"
  | "anonymous";

function SyncBadge({ status }: { status?: SyncStatus }) {
  if (!status) return null;
  const map: Record<SyncStatus, { label: string; color: string; icon: string }> = {
    idle: { label: "Idle", color: "text-on-surface-variant", icon: "cloud" },
    loading: { label: "Loading…", color: "text-on-surface-variant", icon: "cloud_download" },
    saving: { label: "Saving…", color: "text-tertiary-fixed-dim", icon: "cloud_upload" },
    saved: { label: "Saved", color: "text-on-surface-variant", icon: "cloud_done" },
    error: { label: "Save failed", color: "text-error", icon: "cloud_off" },
    anonymous: {
      label: "Sign in to save",
      color: "text-on-surface-variant",
      icon: "cloud_off",
    },
  };
  const m = map[status];
  return (
    <span
      className={`hidden md:inline-flex items-center gap-1 text-label-sm font-label-sm ${m.color}`}
    >
      <span className="material-symbols-outlined text-[16px]">{m.icon}</span>
      {m.label}
    </span>
  );
}

export function EditorHeader({
  title,
  onTitleChange,
  onSave,
  onSell,
  onExport,
  syncStatus,
  canSell,
  userPlan,
}: {
  title?: string;
  onTitleChange?: (next: string) => void;
  onSave?: () => void;
  onSell?: () => void;
  onExport?: () => void;
  syncStatus?: SyncStatus;
  /** True when the doc has been saved to the cloud (has an id) and the user
   *  is signed in — required to put a listing on the marketplace. */
  canSell?: boolean;
  /** The signed-in user's plan ("free", "pro", "team", "admin"). When
   *  anything other than "free" the upgrade nudge stays hidden. */
  userPlan?: string;
}) {
  const pathname = usePathname();
  const isProRoute = pathname?.startsWith("/editor/pro");
  const showUpgrade = (userPlan ?? "free") === "free";
  const editable = !!onTitleChange;

  // Local mirror so typing is smooth even while the cloud sync is in flight.
  const [localTitle, setLocalTitle] = useState(title ?? "");
  useEffect(() => {
    setLocalTitle(title ?? "");
  }, [title]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 bg-surface-container/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link
          href="/"
          aria-label="Addvoxen home"
          className="font-headline-lg text-headline-lg font-bold tracking-tighter text-primary hover:opacity-80 transition-opacity leading-none shrink-0"
        >
          Addvoxen
        </Link>
        <span className="px-2 py-0.5 bg-primary-container/20 text-primary-fixed-dim rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">
          {isProRoute ? "Pro" : "Editor"}
        </span>
        <span className="text-on-surface-variant hidden sm:inline shrink-0">
          /
        </span>
        {editable ? (
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={(e) => onTitleChange(e.target.value.trim() || "Untitled design")}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="bg-transparent text-on-surface text-label-md font-label-md focus:outline-none focus:bg-surface-container-high/40 rounded-md px-2 py-1 min-w-0 flex-1 max-w-65 truncate"
            placeholder="Untitled design"
          />
        ) : (
          title && (
            <span className="text-on-surface text-label-md font-label-md truncate max-w-65">
              {title}
            </span>
          )
        )}
        <SyncBadge status={syncStatus} />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {showUpgrade && (
          <Link
            href="/pricing"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-label-sm font-label-sm text-tertiary-fixed-dim hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            Upgrade to Pro
          </Link>
        )}
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">save</span>
          Save
        </button>
        {onSell && (
          <button
            type="button"
            onClick={onSell}
            disabled={!canSell}
            title={
              canSell
                ? "Publish this design on the marketplace"
                : "Sign in and make at least one edit so we can save your draft first"
            }
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-label-sm font-label-sm text-tertiary-fixed-dim hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            Save & Sell
          </button>
        )}
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-1 bg-primary text-on-primary px-3 py-1.5 rounded-lg text-label-sm font-label-sm hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">
            file_download
          </span>
          Export
        </button>
        <Link
          href="/dashboard"
          aria-label="Exit editor"
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </Link>
      </div>
    </header>
  );
}
