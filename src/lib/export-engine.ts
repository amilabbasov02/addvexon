/**
 * Render an EditorDocument to PNG / JPEG / PDF on the client, without
 * touching the visible editor canvas. Uses a detached Konva Stage so we
 * can also export sizes the user isn't currently viewing (Magic Resize
 * pack export).
 *
 * Browser-only — call from "use client" code.
 */
import Konva from "konva";
import JSZip from "jszip";
import jsPDF from "jspdf";
import type { EditorDocument, Layer } from "@/components/editor/types";
import { magicResize } from "./magic-resize";
import type { AdFormat } from "./ad-formats";

// ============================================================
//  Internal: render to PNG via offscreen Konva Stage
// ============================================================
function buildStage(doc: EditorDocument): {
  stage: Konva.Stage;
  container: HTMLDivElement;
  layer: Konva.Layer;
} {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-99999px";
  container.style.top = "-99999px";
  container.style.width = `${doc.canvasSize.width}px`;
  container.style.height = `${doc.canvasSize.height}px`;
  document.body.appendChild(container);

  const stage = new Konva.Stage({
    container,
    width: doc.canvasSize.width,
    height: doc.canvasSize.height,
  });
  const layer = new Konva.Layer();
  stage.add(layer);

  // Background rect
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: doc.canvasSize.width,
      height: doc.canvasSize.height,
      fill: doc.background,
    }),
  );

  return { stage, container, layer };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

async function addLayerToKonva(layer: Layer, kLayer: Konva.Layer): Promise<void> {
  if (!layer.visible) return;
  if (layer.type === "rect") {
    kLayer.add(
      new Konva.Rect({
        x: layer.x,
        y: layer.y,
        width: layer.width,
        height: layer.height,
        fill: layer.fill,
        cornerRadius: layer.cornerRadius,
        rotation: layer.rotation,
        opacity: layer.opacity,
        stroke: layer.stroke,
        strokeWidth: layer.strokeWidth ?? 0,
      }),
    );
    return;
  }
  if (layer.type === "circle") {
    kLayer.add(
      new Konva.Circle({
        x: layer.x,
        y: layer.y,
        radius: layer.radius,
        fill: layer.fill,
        rotation: layer.rotation,
        opacity: layer.opacity,
        stroke: layer.stroke,
        strokeWidth: layer.strokeWidth ?? 0,
      }),
    );
    return;
  }
  if (layer.type === "text") {
    kLayer.add(
      new Konva.Text({
        x: layer.x,
        y: layer.y,
        text: layer.text,
        fontSize: layer.fontSize,
        fontFamily: layer.fontFamily,
        fontStyle:
          `${layer.fontStyle === "italic" ? "italic " : ""}${layer.fontWeight}`.trim(),
        fill: layer.fill,
        align: layer.align,
        width: layer.width,
        rotation: layer.rotation,
        opacity: layer.opacity,
      }),
    );
    return;
  }
  if (layer.type === "image") {
    try {
      const img = await loadImage(layer.src);
      kLayer.add(
        new Konva.Image({
          x: layer.x,
          y: layer.y,
          width: layer.width,
          height: layer.height,
          image: img,
          rotation: layer.rotation,
          opacity: layer.opacity,
        }),
      );
    } catch {
      // skip broken images rather than failing the entire export
    }
  }
}

async function renderToDataUrl(
  doc: EditorDocument,
  opts: { pixelRatio?: number; mimeType?: string; quality?: number } = {},
): Promise<string> {
  const { stage, container, layer } = buildStage(doc);
  try {
    for (const l of doc.layers) {
      await addLayerToKonva(l, layer);
    }
    layer.draw();
    // Ensure async images that may have loaded after draw() are flushed.
    await new Promise<void>((res) => requestAnimationFrame(() => res()));
    layer.draw();

    return stage.toDataURL({
      pixelRatio: opts.pixelRatio ?? 2,
      mimeType: opts.mimeType ?? "image/png",
      quality: opts.quality,
    });
  } finally {
    stage.destroy();
    container.remove();
  }
}

function dataUrlToBase64(uri: string): { base64: string; mime: string } {
  const idx = uri.indexOf(",");
  const meta = uri.slice(5, idx); // "image/png;base64"
  const mime = meta.split(";")[0];
  return { base64: uri.slice(idx + 1), mime };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
}

function dataUrlToBlob(uri: string): Blob {
  const { base64, mime } = dataUrlToBase64(uri);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// ============================================================
//  WATERMARK overlay (Free tier)
// ============================================================
async function applyWatermark(
  dataUrl: string,
  width: number,
  height: number,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth || width;
      c.height = img.naturalHeight || height;
      const ctx = c.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const pad = Math.max(12, c.width * 0.012);
      const fontSize = Math.max(14, c.width * 0.022);
      ctx.font = `600 ${fontSize}px "Geist", system-ui, sans-serif`;
      const text = "Made with Addvoxen";
      const tw = ctx.measureText(text).width;
      const bw = tw + pad * 2;
      const bh = fontSize * 1.8;
      const x = c.width - bw - pad;
      const y = c.height - bh - pad;
      const r = bh / 2;
      ctx.fillStyle = "rgba(11,19,38,0.78)";
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + bw, y, x + bw, y + bh, r);
      ctx.arcTo(x + bw, y + bh, x, y + bh, r);
      ctx.arcTo(x, y + bh, x, y, r);
      ctx.arcTo(x, y, x + bw, y, r);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#d0bcff";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x + pad, y + bh / 2);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ============================================================
//  Public API
// ============================================================
export type ExportOptions = {
  watermark?: boolean;
  pixelRatio?: number;
};

export type ExportResult = {
  filename: string;
  blob: Blob;
};

function safeFilename(base: string) {
  return base.replace(/[^\w.-]+/g, "-").slice(0, 80);
}

/** Export the current document as a PNG at 2× pixel ratio. */
export async function exportPNG(
  doc: EditorDocument,
  opts: ExportOptions = {},
): Promise<ExportResult> {
  let uri = await renderToDataUrl(doc, {
    pixelRatio: opts.pixelRatio ?? 2,
    mimeType: "image/png",
  });
  if (opts.watermark) {
    uri = await applyWatermark(uri, doc.canvasSize.width, doc.canvasSize.height);
  }
  return {
    filename: safeFilename(`addvoxen-${doc.canvasSize.width}x${doc.canvasSize.height}.png`),
    blob: dataUrlToBlob(uri),
  };
}

/** Export as JPEG (smaller filesize for photo-heavy designs). */
export async function exportJPG(
  doc: EditorDocument,
  opts: ExportOptions = {},
): Promise<ExportResult> {
  let uri = await renderToDataUrl(doc, {
    pixelRatio: opts.pixelRatio ?? 2,
    mimeType: "image/jpeg",
    quality: 0.92,
  });
  if (opts.watermark) {
    uri = await applyWatermark(uri, doc.canvasSize.width, doc.canvasSize.height);
  }
  return {
    filename: safeFilename(`addvoxen-${doc.canvasSize.width}x${doc.canvasSize.height}.jpg`),
    blob: dataUrlToBlob(uri),
  };
}

/** Export as PDF (single page, sized to the canvas). */
export async function exportPDF(
  doc: EditorDocument,
  opts: ExportOptions = {},
): Promise<ExportResult> {
  let uri = await renderToDataUrl(doc, {
    pixelRatio: opts.pixelRatio ?? 2,
    mimeType: "image/png",
  });
  if (opts.watermark) {
    uri = await applyWatermark(uri, doc.canvasSize.width, doc.canvasSize.height);
  }
  const { width, height } = doc.canvasSize;
  const pdf = new jsPDF({
    orientation: width > height ? "landscape" : "portrait",
    unit: "px",
    format: [width, height],
    hotfixes: ["px_scaling"],
  });
  pdf.addImage(uri, "PNG", 0, 0, width, height, undefined, "FAST");
  const blob = pdf.output("blob");
  return {
    filename: safeFilename(`addvoxen-${width}x${height}.pdf`),
    blob,
  };
}

/** Export a pack of formats (Magic Resize → ZIP of PNGs + manifest.json). */
export async function exportPack(
  doc: EditorDocument,
  formats: AdFormat[],
  opts: ExportOptions & { packLabel?: string; progress?: (done: number, total: number, label: string) => void } = {},
): Promise<ExportResult> {
  const zip = new JSZip();
  const manifest: Array<{ id: string; name: string; placement: string; width: number; height: number; file: string }> = [];

  for (let i = 0; i < formats.length; i++) {
    const f = formats[i];
    opts.progress?.(i, formats.length, f.name);
    const resized = magicResize(doc, { width: f.width, height: f.height });
    let uri = await renderToDataUrl(resized, {
      pixelRatio: opts.pixelRatio ?? 2,
      mimeType: "image/png",
    });
    if (opts.watermark) {
      uri = await applyWatermark(uri, f.width, f.height);
    }
    const { base64 } = dataUrlToBase64(uri);
    const filename = `${f.id}-${f.width}x${f.height}.png`;
    zip.file(filename, base64, { base64: true });
    manifest.push({
      id: f.id,
      name: f.name,
      placement: f.placement,
      width: f.width,
      height: f.height,
      file: filename,
    });
  }

  // Include manifest + README per platform
  const platformLabel = opts.packLabel ?? formats[0]?.platform ?? "pack";
  zip.file(
    "manifest.json",
    JSON.stringify(
      {
        generator: "Addvoxen",
        generatedAt: new Date().toISOString(),
        platform: platformLabel,
        canvasSource: {
          width: doc.canvasSize.width,
          height: doc.canvasSize.height,
        },
        files: manifest,
      },
      null,
      2,
    ),
  );
  zip.file(
    "README.txt",
    [
      `Addvoxen export — ${platformLabel}`,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `This bundle contains ${manifest.length} creative${manifest.length === 1 ? "" : "s"}`,
      `auto-resized from your original ${doc.canvasSize.width}×${doc.canvasSize.height} design.`,
      ``,
      `Upload these directly to your campaign manager:`,
      ...manifest.map((m) => `  - ${m.file}  (${m.name}, ${m.placement})`),
    ].join("\n"),
  );

  opts.progress?.(formats.length, formats.length, "Bundling…");
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  return {
    filename: safeFilename(`addvoxen-${platformLabel}-${Date.now()}.zip`),
    blob,
  };
}

/**
 * Export the design as an **HTML5 banner** — a self-contained, click-tag-
 * compatible HTML file packaged with the standard ad.size meta tag and
 * `clickTag` macro used by Google Ads / DoubleClick / IAB display.
 *
 * All assets are inlined (images as data URLs, fonts via Google Fonts link)
 * so the .zip you download can be uploaded straight into Campaign Manager
 * with no relative-path surprises.
 */
export async function exportHTML5(
  doc: EditorDocument,
  opts: ExportOptions & { clickUrl?: string } = {},
): Promise<ExportResult> {
  const { width, height } = doc.canvasSize;
  const watermark = opts.watermark === true;
  // Sanitize the optional landing URL — only allow http(s). Falls back to
  // the marketing site so the clickTag macro is always something sensible.
  let clickUrl = (opts.clickUrl ?? "").trim();
  if (clickUrl && !/^https?:\/\//i.test(clickUrl)) {
    clickUrl = `https://${clickUrl}`;
  }
  if (!clickUrl) clickUrl = "https://addvoxen.com";

  // Inline every image src as a data URL so the .html is fully portable.
  const inlinedSrcByOriginal = new Map<string, string>();
  for (const layer of doc.layers) {
    if (layer.type !== "image" || !layer.src) continue;
    if (layer.src.startsWith("data:")) {
      inlinedSrcByOriginal.set(layer.src, layer.src);
      continue;
    }
    try {
      const blob = await fetch(layer.src, { mode: "cors" }).then((r) => r.blob());
      const dataUrl: string = await new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result as string);
        fr.onerror = () => rej(new Error("read failed"));
        fr.readAsDataURL(blob);
      });
      inlinedSrcByOriginal.set(layer.src, dataUrl);
    } catch {
      // If CORS / network blocks us, fall back to the original URL — the
      // banner will still render in the publisher's browser.
      inlinedSrcByOriginal.set(layer.src, layer.src);
    }
  }

  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const layerHtml: string[] = doc.layers
    .filter((l) => l.visible !== false)
    .map((l) => {
      const common = `position:absolute;left:${l.x}px;top:${l.y}px;opacity:${l.opacity};transform:rotate(${l.rotation}deg);transform-origin:top left;`;
      if (l.type === "rect") {
        return `<div style="${common}width:${l.width}px;height:${l.height}px;background:${l.fill};border-radius:${l.cornerRadius ?? 0}px;${l.stroke ? `border:${l.strokeWidth ?? 1}px solid ${l.stroke};` : ""}"></div>`;
      }
      if (l.type === "circle") {
        return `<div style="${common}width:${l.radius * 2}px;height:${l.radius * 2}px;left:${l.x - l.radius}px;top:${l.y - l.radius}px;border-radius:50%;background:${l.fill};${l.stroke ? `border:${l.strokeWidth ?? 1}px solid ${l.stroke};` : ""}"></div>`;
      }
      if (l.type === "text") {
        const safe = esc(l.text);
        const family = l.fontFamily || "Inter";
        const styleBits = [
          common,
          `font-family:'${family}',system-ui,sans-serif`,
          `font-size:${l.fontSize}px`,
          `font-weight:${l.fontWeight}`,
          `font-style:${l.fontStyle ?? "normal"}`,
          `color:${l.fill}`,
          `line-height:1.15`,
          `text-align:${l.align ?? "left"}`,
          l.width ? `width:${l.width}px` : "",
          "white-space:pre-wrap",
          "word-wrap:break-word",
          "margin:0",
        ]
          .filter(Boolean)
          .join(";");
        return `<div style="${styleBits}">${safe.replace(/\n/g, "<br>")}</div>`;
      }
      if (l.type === "image") {
        const src = inlinedSrcByOriginal.get(l.src) ?? l.src;
        return `<img src="${esc(src)}" alt="" style="${common}width:${l.width}px;height:${l.height}px;object-fit:cover;display:block;pointer-events:none;" crossorigin="anonymous">`;
      }
      return "";
    });

  const watermarkBadge = watermark
    ? `<div style="position:absolute;right:8px;bottom:8px;background:rgba(11,19,38,0.78);color:#d0bcff;padding:4px 10px;border-radius:999px;font:600 11px/1 system-ui,sans-serif;letter-spacing:0.02em;pointer-events:none;">Made with Addvoxen</div>`
    : "";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${width}">
<!-- IAB / Google Ads click-tag macro. Publishers replace this with the
     real landing URL via the ad server. -->
<meta name="ad.size" content="width=${width},height=${height}">
<title>Addvoxen banner ${width}x${height}</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${width}px;height:${height}px;overflow:hidden;background:${doc.background};}
  body{font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
  .stage{position:relative;width:${width}px;height:${height}px;overflow:hidden;background:${doc.background};cursor:pointer;}
</style>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Playfair+Display:wght@700;900&family=Geist:wght@500;600;700;900&display=swap" rel="stylesheet">
<script>
  // clickTag is the standard variable name ad networks look for. The ad
  // server overrides this; locally it just opens the placeholder URL.
  var clickTag = "${clickUrl.replace(/"/g, '\\"')}";
  function onBannerClick(){ window.open(clickTag, "_blank"); }
</script>
</head>
<body>
  <a id="banner-link" href="javascript:onBannerClick()" style="display:block;text-decoration:none;color:inherit;">
    <div class="stage">
      ${layerHtml.join("\n      ")}
      ${watermarkBadge}
    </div>
  </a>
</body>
</html>`;

  const zip = new JSZip();
  const baseName = `addvoxen-banner-${width}x${height}`;
  zip.file(`${baseName}/index.html`, html);
  zip.file(
    `${baseName}/manifest.json`,
    JSON.stringify(
      {
        generator: "Addvoxen",
        generatedAt: new Date().toISOString(),
        format: "html5-banner",
        clickTag: true,
        size: { width, height },
        adSizeMeta: `width=${width},height=${height}`,
      },
      null,
      2,
    ),
  );
  zip.file(
    `${baseName}/README.txt`,
    [
      `Addvoxen HTML5 banner — ${width}×${height}`,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `Files:`,
      `  index.html       — self-contained banner with inlined assets`,
      `  manifest.json    — machine-readable metadata`,
      ``,
      `Compatibility:`,
      `  - Google Ads / Display & Video 360 (clickTag macro)`,
      `  - DoubleClick Campaign Manager`,
      `  - IAB display HTML5 spec (ad.size meta tag)`,
      ``,
      `Upload index.html (or this whole .zip) directly to Campaign Manager.`,
      `The clickTag value is the landing URL — your ad server overrides it.`,
    ].join("\n"),
  );

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  return { filename: safeFilename(`${baseName}.zip`), blob };
}

export function triggerDownload(result: ExportResult) {
  downloadBlob(result.blob, result.filename);
}
