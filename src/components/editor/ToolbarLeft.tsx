"use client";

import { useRef } from "react";
import type { EditorStore } from "./useEditorStore";

const TOOLS = [
  { id: "text", label: "Text", icon: "title" },
  { id: "rect", label: "Rectangle", icon: "rectangle" },
  { id: "circle", label: "Circle", icon: "circle" },
  { id: "image", label: "Image", icon: "image" },
  { id: "background", label: "Background", icon: "palette" },
] as const;

export function ToolbarLeft({
  store,
  signedIn = false,
  onOpenTemplates,
}: {
  store: EditorStore;
  signedIn?: boolean;
  onOpenTemplates?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const addFromUrlOrDataUrl = (src: string) => {
    const img = new window.Image();
    img.onload = () => {
      const maxSide = Math.min(
        600,
        store.doc.canvasSize.width * 0.7,
        store.doc.canvasSize.height * 0.7,
      );
      const ratio = img.width / img.height;
      const w = ratio >= 1 ? maxSide : maxSide * ratio;
      const h = ratio >= 1 ? maxSide / ratio : maxSide;
      store.addImage(src, w, h);
    };
    img.onerror = () => store.addImage(src, 400, 300);
    img.src = src;
  };

  const onFileChosen = async (file: File) => {
    if (signedIn) {
      // Cloud upload — keeps the document JSON small + lets dashboard
      // thumbnails reference the same URL.
      try {
        const fd = new FormData();
        fd.append("file", file);
        const resp = await fetch("/api/upload", { method: "POST", body: fd });
        if (resp.ok) {
          const data = (await resp.json()) as { url: string };
          addFromUrlOrDataUrl(data.url);
          return;
        }
        // Fall through to dataURL on failure
      } catch {
        /* fall through */
      }
    }
    // Anonymous OR upload failed → embed as data URL.
    const reader = new FileReader();
    reader.onload = () => addFromUrlOrDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <aside className="w-20 flex flex-col items-center py-4 gap-2 bg-surface-container/70 backdrop-blur-xl border-r border-white/10">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChosen(f);
          e.target.value = "";
        }}
      />
      {onOpenTemplates && (
        <button
          type="button"
          onClick={onOpenTemplates}
          className="w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 text-tertiary-fixed-dim hover:bg-white/5 transition-colors border border-tertiary/30"
        >
          <span className="material-symbols-outlined text-[20px]">grid_view</span>
          <span className="text-[10px] font-label-sm tracking-wider">Templates</span>
        </button>
      )}
      <div className="w-12 h-px bg-white/10" />
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          className="group w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
          onClick={() => {
            if (tool.id === "text") store.addText();
            else if (tool.id === "rect") store.addRect();
            else if (tool.id === "circle") store.addCircle();
            else if (tool.id === "image") fileRef.current?.click();
            else if (tool.id === "background") {
              // Deselect any layer so the right Properties panel switches to
              // Canvas Background controls (swatches + picker live there now).
              store.setSelectedId(null);
            }
          }}
        >
          {tool.id === "background" ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                {tool.icon}
              </span>
              <span className="text-[10px] font-label-sm tracking-wider">
                {tool.label}
              </span>
            </div>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">
                {tool.icon}
              </span>
              <span className="text-[10px] font-label-sm tracking-wider">
                {tool.label}
              </span>
            </>
          )}
        </button>
      ))}
    </aside>
  );
}
