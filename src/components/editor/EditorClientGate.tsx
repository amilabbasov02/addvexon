"use client";

import { useEffect, useState } from "react";
import { EditorApp, type EditorAppProps } from "./EditorApp";

/**
 * Mount the editor only on the client. We previously used next/dynamic with
 * ssr: false, but on slow connections (e.g. Cloudflare quick tunnel) the
 * extra round-trip for the dynamic chunk kept users stuck on "Loading
 * editor…". A simple `mounted` guard achieves the same SSR safety with
 * one fewer network hop.
 */
export function EditorClientGate(props: EditorAppProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-2xl ai-gradient opacity-20" />
            <div className="absolute inset-0 rounded-2xl ai-gradient animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-2xl">
                draw
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-on-surface font-label-md text-label-md">
              Preparing canvas…
            </p>
            <p className="text-on-surface-variant text-label-sm font-label-sm mt-1">
              Loading the Addvoxen AI editor
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <EditorApp {...props} />;
}
