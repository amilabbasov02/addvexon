"use client";

import { useEffect, useRef, useState } from "react";
import { LayerThumb } from "./LayerThumb";

/**
 * Snapshot of an EditorDocument for grid cards.
 *
 *  - `thumbnailUrl` ending in `.html` → render the *original* design through
 *    an iframe, scaled to fit the card. Preserves images, gradients and
 *    glass effects that the simplified SVG fallback throws away.
 *  - Plain image URL → render as <img>.
 *  - Otherwise → inline SVG layer reproduction.
 */
export function DocumentThumbnail({
  background,
  canvasSize,
  layers,
  thumbnailUrl,
}: {
  background: string;
  canvasSize: { width: number; height: number };
  layers: unknown[];
  thumbnailUrl?: string | null;
}) {
  if (thumbnailUrl && thumbnailUrl.endsWith(".html")) {
    return <IframePreview url={thumbnailUrl} canvasSize={canvasSize} />;
  }
  if (thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbnailUrl}
        alt="design preview"
        className="w-full h-full object-contain"
      />
    );
  }
  return (
    <svg
      viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block"
      style={{ background }}
      aria-hidden
    >
      {(layers as unknown[]).map((layer, i) => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <LayerThumb key={(layer as any)?.id ?? i} layer={layer as any} />
      ))}
    </svg>
  );
}

function IframePreview({
  url,
  canvasSize,
}: {
  url: string;
  canvasSize: { width: number; height: number };
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Start tiny but non-zero — browsers won't render zero-scaled content, but
  // we still want the iframe in the DOM immediately so it can start loading
  // its Tailwind CDN + fonts while we measure the wrapper.
  const [scale, setScale] = useState(0.05);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      const s = Math.min(w / canvasSize.width, h / canvasSize.height);
      if (s > 0 && Math.abs(s - scale) > 0.001) setScale(s);
    };
    // First synchronous measure (the wrapper has its layout box already by
    // the time useEffect fires).
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize.width, canvasSize.height, url]);

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 grid place-items-center overflow-hidden bg-surface-container-lowest"
    >
      <iframe
        src={url}
        loading="lazy"
        scrolling="no"
        sandbox="allow-scripts allow-same-origin"
        title="banner preview"
        className="border-0 pointer-events-none block"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          // Without this the iframe's intrinsic box pushes the grid item out
          // of centre. flex-shrink:0 keeps it at its declared dimensions so
          // the scale + place-items math stays stable.
          flexShrink: 0,
        }}
      />
    </div>
  );
}
