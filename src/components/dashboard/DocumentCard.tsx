"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DocumentThumbnail } from "./DocumentThumbnail";
import { SellDialog } from "./SellDialog";
import { LaunchAdDialog } from "./LaunchAdDialog";

type Doc = {
  id: string;
  title: string;
  canvasSize: unknown;
  thumbnailUrl: string | null;
  background: string;
  layers: unknown;
  updatedAt: Date;
};

function relativeTime(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}

export function DocumentCard({ doc }: { doc: Doc }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const size = doc.canvasSize as { width: number; height: number };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", close);
      return () => document.removeEventListener("mousedown", close);
    }
  }, [menuOpen]);

  const onDelete = async () => {
    if (!confirm(`Delete "${doc.title}"? This can't be undone.`)) return;
    setMenuOpen(false);
    setDeleting(true);
    try {
      const r = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
      if (r.ok) router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* overflow-hidden is scoped to the thumbnail link so the absolute-
       *  positioned menu dropdown can escape the card without being clipped. */}
      <div className="group relative flex flex-col glass-panel rounded-2xl hover:border-primary/50 border border-white/10 transition-all hover:shadow-[0_0_30px_rgba(208,188,255,0.15)]">
        <Link
          href={`/editor?doc=${doc.id}`}
          className="block aspect-4/3 bg-surface-container-lowest overflow-hidden relative rounded-t-2xl"
        >
          <DocumentThumbnail
            background={doc.background}
            canvasSize={size}
            layers={doc.layers as unknown[]}
            thumbnailUrl={doc.thumbnailUrl ?? undefined}
          />
        </Link>

        <div className="p-4 flex items-center justify-between gap-2">
          <Link
            href={`/editor?doc=${doc.id}`}
            className="min-w-0 flex-1 hover:text-primary transition-colors"
          >
            <p className="text-on-surface font-label-md text-label-md truncate">
              {doc.title}
            </p>
            <p className="text-on-surface-variant text-label-sm font-label-sm truncate">
              {size?.width}×{size?.height} · {relativeTime(doc.updatedAt)}
            </p>
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="More actions"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                more_vert
              </span>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1 w-56 bg-surface-container-high border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50 py-1"
              >
                <Link
                  href={`/editor?doc=${doc.id}`}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Open in editor
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setAdOpen(true);
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md text-tertiary-fixed-dim hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    rocket_launch
                  </span>
                  Launch as Ad
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setSellOpen(true);
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    storefront
                  </span>
                  Sell as template
                </button>
                <div className="border-t border-white/10 my-1" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={onDelete}
                  disabled={deleting}
                  className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md text-error hover:bg-error-container/20 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {deleting ? "progress_activity" : "delete"}
                  </span>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SellDialog
        open={sellOpen}
        document={{ id: doc.id, title: doc.title }}
        onClose={() => setSellOpen(false)}
        onSuccess={() => {}}
      />
      <LaunchAdDialog
        open={adOpen}
        document={{ id: doc.id, title: doc.title }}
        onClose={() => setAdOpen(false)}
        onSuccess={() => router.push("/campaigns")}
      />
    </>
  );
}
