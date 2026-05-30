"use client";

/**
 * Render a single editor layer as SVG. Subset of Konva primitives that
 * dashboard thumbnails need — keep it cheap, no animations / filters.
 */
type AnyLayer = {
  id?: string;
  type: "rect" | "circle" | "text" | "image";
  x: number;
  y: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  fill?: string;
  width?: number;
  height?: number;
  cornerRadius?: number;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  align?: "left" | "center" | "right";
  src?: string;
};

export function LayerThumb({ layer }: { layer: AnyLayer }) {
  if (!layer || layer.visible === false) return null;
  const op = layer.opacity ?? 1;
  const rot = layer.rotation ?? 0;
  const transform = `rotate(${rot} ${layer.x} ${layer.y})`;

  if (layer.type === "rect") {
    return (
      <rect
        x={layer.x}
        y={layer.y}
        width={layer.width}
        height={layer.height}
        rx={layer.cornerRadius}
        ry={layer.cornerRadius}
        fill={layer.fill}
        opacity={op}
        transform={transform}
        stroke={layer.stroke}
        strokeWidth={layer.strokeWidth ?? 0}
      />
    );
  }
  if (layer.type === "circle") {
    return (
      <circle
        cx={layer.x}
        cy={layer.y}
        r={layer.radius}
        fill={layer.fill}
        opacity={op}
      />
    );
  }
  if (layer.type === "text") {
    const lines = (layer.text ?? "").split("\n");
    const fs = layer.fontSize ?? 32;
    const lh = fs * 1.05;
    const align = layer.align ?? "left";
    return (
      <text
        x={layer.x}
        y={layer.y + fs * 0.85}
        fill={layer.fill}
        fontFamily={layer.fontFamily}
        fontSize={fs}
        fontWeight={layer.fontWeight}
        fontStyle={layer.fontStyle}
        opacity={op}
        transform={transform}
        textAnchor={
          align === "center" ? "middle" : align === "right" ? "end" : "start"
        }
      >
        {lines.map((line, i) => (
          <tspan
            key={i}
            x={
              align === "center"
                ? layer.x + (layer.width ?? 0) / 2
                : align === "right"
                  ? layer.x + (layer.width ?? 0)
                  : layer.x
            }
            dy={i === 0 ? 0 : lh}
          >
            {line || " "}
          </tspan>
        ))}
      </text>
    );
  }
  if (layer.type === "image" && layer.src) {
    return (
      <image
        href={layer.src}
        x={layer.x}
        y={layer.y}
        width={layer.width}
        height={layer.height}
        opacity={op}
        transform={transform}
        preserveAspectRatio="xMidYMid slice"
      />
    );
  }
  return null;
}
