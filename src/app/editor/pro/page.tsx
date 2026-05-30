"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EditorClientGate } from "@/components/editor/EditorClientGate";

function EditorKeyed() {
  const search = useSearchParams();
  const key = search.get("doc") ?? search.get("template") ?? "blank";
  return <EditorClientGate key={key} pro />;
}

export default function EditorProPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-surface">
          <div className="flex flex-col items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">
              progress_activity
            </span>
            <p className="text-label-sm font-label-sm">Opening Pro editor…</p>
          </div>
        </div>
      }
    >
      <EditorKeyed />
    </Suspense>
  );
}
