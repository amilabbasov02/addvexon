export type LayerCommon = {
  id: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
};

export type TextLayer = LayerCommon & {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontStyle: "normal" | "italic";
  fontWeight: "400" | "500" | "600" | "700" | "900";
  align: "left" | "center" | "right";
  width?: number;
};

export type RectLayer = LayerCommon & {
  type: "rect";
  width: number;
  height: number;
  fill: string;
  cornerRadius: number;
  stroke?: string;
  strokeWidth?: number;
};

export type CircleLayer = LayerCommon & {
  type: "circle";
  radius: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
};

export type ImageLayer = LayerCommon & {
  type: "image";
  src: string;
  width: number;
  height: number;
};

export type Layer = TextLayer | RectLayer | CircleLayer | ImageLayer;

export type Filters = {
  brightness: number; // -1 .. 1
  contrast: number;   // -100 .. 100
  saturation: number; // -2 .. 10
  blur: number;       // 0 .. 40
};

export const DEFAULT_FILTERS: Filters = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
};

export type EditorDocument = {
  layers: Layer[];
  background: string;
  canvasSize: { width: number; height: number };
};

export const DEFAULT_DOCUMENT: EditorDocument = {
  layers: [],
  background: "#0b1326",
  canvasSize: { width: 1080, height: 1080 },
};

export const TEMPLATE_PRESETS: { id: string; label: string; size: { width: number; height: number } }[] = [
  { id: "square", label: "Square 1:1 (1080)", size: { width: 1080, height: 1080 } },
  { id: "story", label: "Story 9:16 (1080×1920)", size: { width: 1080, height: 1920 } },
  { id: "portrait", label: "Portrait 4:5 (1080×1350)", size: { width: 1080, height: 1350 } },
  { id: "landscape", label: "Landscape 16:9 (1280×720)", size: { width: 1280, height: 720 } },
  { id: "banner", label: "Banner 728×90", size: { width: 728, height: 90 } },
  { id: "leaderboard", label: "Wide 970×250", size: { width: 970, height: 250 } },
];
