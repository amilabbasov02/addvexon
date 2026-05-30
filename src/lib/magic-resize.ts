/**
 * Magic Resize — adapt an EditorDocument from one canvas size to another.
 *
 * Pragmatic approach: scale layers by the dominant axis (so text stays
 * legible), then re-anchor each layer to the closest canvas edge it was on.
 * Layers that were centred stay centred. Layers near a corner stay near
 * the same corner. Layers full-bleed (covering the canvas) get rescaled
 * to fully cover the new canvas.
 *
 * Not perfect — but good enough for 95% of marketing creatives without
 * requiring authors to hand-tune every size. Power users can still hand-edit
 * each variant in the editor after resize.
 */
import type {
  EditorDocument,
  Layer,
  TextLayer,
  RectLayer,
  CircleLayer,
  ImageLayer,
} from "@/components/editor/types";

type Anchor = "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br";

function detectAnchor(
  layer: Layer,
  cw: number,
  ch: number,
): { anchor: Anchor; dx: number; dy: number } {
  // Approximate layer centre & bounding box
  const { lx, ly, lw, lh } = layerBox(layer);
  const cxLayer = lx + lw / 2;
  const cyLayer = ly + lh / 2;
  const xT = cxLayer / cw; // 0..1
  const yT = cyLayer / ch;

  const hZone: "l" | "c" | "r" =
    xT < 0.33 ? "l" : xT > 0.67 ? "r" : "c";
  const vZone: "t" | "m" | "b" = yT < 0.33 ? "t" : yT > 0.67 ? "b" : "m";

  const anchor = `${vZone}${hZone}` as Anchor;

  // Offset of layer top-left FROM the anchor reference point on the canvas
  const anchorPoint = anchorPointForCanvas(anchor, cw, ch);
  return {
    anchor,
    dx: lx - anchorPoint.x,
    dy: ly - anchorPoint.y,
  };
}

function anchorPointForCanvas(anchor: Anchor, w: number, h: number) {
  const xMap: Record<string, number> = { l: 0, c: w / 2, r: w };
  const yMap: Record<string, number> = { t: 0, m: h / 2, b: h };
  return { x: xMap[anchor[1]], y: yMap[anchor[0]] };
}

function layerBox(layer: Layer) {
  if (layer.type === "rect" || layer.type === "image") {
    return { lx: layer.x, ly: layer.y, lw: layer.width, lh: layer.height };
  }
  if (layer.type === "circle") {
    return {
      lx: layer.x - layer.radius,
      ly: layer.y - layer.radius,
      lw: layer.radius * 2,
      lh: layer.radius * 2,
    };
  }
  // text
  const t = layer as TextLayer;
  return {
    lx: t.x,
    ly: t.y,
    lw: t.width ?? t.fontSize * 6,
    lh: t.fontSize * 1.2,
  };
}

function isFullBleed(layer: Layer, cw: number, ch: number): boolean {
  if (layer.type === "rect") {
    return (
      layer.x <= 4 &&
      layer.y <= 4 &&
      layer.x + layer.width >= cw - 4 &&
      layer.y + layer.height >= ch - 4
    );
  }
  if (layer.type === "image") {
    return (
      layer.x <= 8 &&
      layer.y <= 8 &&
      layer.x + layer.width >= cw - 8 &&
      layer.y + layer.height >= ch - 8
    );
  }
  return false;
}

export type ResizeOptions = {
  /** "fit" — keep layers visible (scale down if needed). "fill" — stretch to
   *  cover (use for background images). Default: "fit". */
  mode?: "fit" | "fill";
};

export function magicResize(
  doc: EditorDocument,
  newSize: { width: number; height: number },
  opts: ResizeOptions = {},
): EditorDocument {
  const { width: oldW, height: oldH } = doc.canvasSize;
  const { width: newW, height: newH } = newSize;
  if (oldW === newW && oldH === newH) return doc;

  const sx = newW / oldW;
  const sy = newH / oldH;
  // Single scale factor for elements (use the smaller axis so nothing
  // overflows — this is the "fit" behaviour). Text especially benefits
  // from a single scale so glyphs don't squish.
  const s = Math.min(sx, sy);

  const newLayers: Layer[] = doc.layers.map((layer) => {
    const fullBleed = isFullBleed(layer, oldW, oldH);

    if (fullBleed && (layer.type === "rect" || layer.type === "image")) {
      // Full bleed: stretch to new canvas, regardless of mode
      return {
        ...layer,
        x: 0,
        y: 0,
        width: newW,
        height: newH,
      } as Layer;
    }

    const { anchor, dx, dy } = detectAnchor(layer, oldW, oldH);
    const newAnchorPoint = anchorPointForCanvas(anchor, newW, newH);
    // Scale offset so distance from anchor remains proportionally similar
    const newDx = dx * s;
    const newDy = dy * s;
    const newX = newAnchorPoint.x + newDx;
    const newY = newAnchorPoint.y + newDy;

    if (layer.type === "rect") {
      const r = layer as RectLayer;
      return {
        ...r,
        x: newX,
        y: newY,
        width: Math.max(4, r.width * s),
        height: Math.max(4, r.height * s),
        cornerRadius: r.cornerRadius * s,
      };
    }
    if (layer.type === "circle") {
      const c = layer as CircleLayer;
      // Layers store centre in (x,y), so re-derive from box-top-left
      const { lw, lh } = layerBox(layer);
      const newW2 = lw * s;
      const newH2 = lh * s;
      return {
        ...c,
        x: newX + newW2 / 2,
        y: newY + newH2 / 2,
        radius: Math.max(2, c.radius * s),
      };
    }
    if (layer.type === "image") {
      const i = layer as ImageLayer;
      return {
        ...i,
        x: newX,
        y: newY,
        width: Math.max(4, i.width * s),
        height: Math.max(4, i.height * s),
      };
    }
    if (layer.type === "text") {
      const t = layer as TextLayer;
      return {
        ...t,
        x: newX,
        y: newY,
        fontSize: Math.max(8, Math.round(t.fontSize * s)),
        width: t.width ? Math.max(20, t.width * s) : undefined,
      };
    }
    return layer;
  });

  void opts; // reserved for future fit/fill modes
  return {
    ...doc,
    canvasSize: newSize,
    layers: newLayers,
  };
}
