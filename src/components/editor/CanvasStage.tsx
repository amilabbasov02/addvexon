"use client";

import { useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer as KonvaLayer,
  Group,
  Rect,
  Circle,
  Text,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import type Konva from "konva";
import useImage from "use-image";
import type { EditorStore } from "./useEditorStore";
import type { Filters, ImageLayer, Layer } from "./types";

const CANVAS_PADDING = 80; // breathing room around canvas for transformer handles

function KImage({
  layer,
  onSelect,
  onChange,
  draggable,
}: {
  layer: ImageLayer;
  onSelect: () => void;
  onChange: (patch: Partial<Layer>) => void;
  draggable: boolean;
}) {
  const [img] = useImage(layer.src, "anonymous");
  return (
    <KonvaImage
      id={layer.id}
      image={img}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      rotation={layer.rotation}
      opacity={layer.opacity}
      visible={layer.visible}
      draggable={draggable}
      listening={!layer.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const node = e.target as Konva.Image;
        const sx = node.scaleX();
        const sy = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(8, node.width() * sx),
          height: Math.max(8, node.height() * sy),
          rotation: node.rotation(),
        });
      }}
    />
  );
}

export function CanvasStage({
  store,
  viewportRef,
  stageRef,
  filters,
  onScaleChange,
}: {
  store: EditorStore;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  stageRef: React.RefObject<Konva.Stage | null>;
  filters?: Filters;
  onScaleChange?: (scale: number) => void;
}) {
  const { doc, selectedId, setSelectedId, updateLayer } = store;
  const trRef = useRef<Konva.Transformer>(null);
  const contentLayerRef = useRef<Konva.Layer>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Observe viewport so the Stage always fills available space.
  useEffect(() => {
    const onResize = () => {
      const v = viewportRef.current;
      if (!v) return;
      setSize({ w: v.clientWidth, h: v.clientHeight });
    };
    onResize();
    const ro = new ResizeObserver(onResize);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, [viewportRef]);

  // Fit canvas to viewport (with padding) and keep it centred.
  const canvasW = doc.canvasSize.width;
  const canvasH = doc.canvasSize.height;
  const availW = Math.max(80, size.w - CANVAS_PADDING * 2);
  const availH = Math.max(80, size.h - CANVAS_PADDING * 2);
  const scale = Math.min(availW / canvasW, availH / canvasH, 1);
  const drawW = canvasW * scale;
  const drawH = canvasH * scale;
  const offsetX = (size.w - drawW) / 2;
  const offsetY = (size.h - drawH) / 2;

  useEffect(() => {
    onScaleChange?.(scale);
  }, [scale, onScaleChange]);

  // Attach the transformer to whichever node is selected.
  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    if (!selectedId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }
    const node = stage.findOne("#" + selectedId);
    if (node) {
      tr.nodes([node]);
      tr.getLayer()?.batchDraw();
    } else {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
    }
  }, [selectedId, doc.layers, stageRef]);

  // Apply Konva image filters (Pro mode)
  useEffect(() => {
    const layer = contentLayerRef.current;
    if (!layer) return;
    layer.children?.forEach((node) => {
      if (node.className !== "Image") return;
      if (!filters) {
        node.filters([]);
        node.clearCache();
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Konva = (window as any).Konva;
      if (!Konva) return;
      try {
        node.cache();
        node.filters([
          Konva.Filters.Brighten,
          Konva.Filters.Contrast,
          Konva.Filters.HSL,
          Konva.Filters.Blur,
        ]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const n = node as any;
        n.brightness(filters.brightness);
        n.contrast(filters.contrast);
        n.saturation(filters.saturation);
        n.blurRadius(filters.blur);
      } catch {
        /* node not ready yet */
      }
    });
    layer.batchDraw();
  }, [filters, doc.layers]);

  const handleStageMouseDown = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    // Click on empty stage or canvas background deselects
    const target = e.target;
    const isStage = target === target.getStage();
    const isBackground = target.name() === "canvas-background";
    if (isStage || isBackground) {
      setSelectedId(null);
    }
  };

  if (size.w === 0 || size.h === 0) return null;

  return (
    <Stage
      ref={stageRef}
      width={size.w}
      height={size.h}
      onMouseDown={handleStageMouseDown}
      onTouchStart={handleStageMouseDown}
      style={{ cursor: selectedId ? "move" : "default" }}
    >
      <KonvaLayer ref={contentLayerRef}>
        {/* Canvas background (acts as the white "paper") with soft drop shadow */}
        <Rect
          name="canvas-background"
          x={offsetX}
          y={offsetY}
          width={drawW}
          height={drawH}
          fill={doc.background}
          shadowColor="#000000"
          shadowBlur={60}
          shadowOpacity={0.45}
          shadowOffsetY={20}
          cornerRadius={4}
          listening
        />
        {/* Scaled content group — drawn at canvas-natural coordinates */}
        <Group x={offsetX} y={offsetY} scaleX={scale} scaleY={scale} clipFunc={(ctx) => {
          ctx.beginPath();
          ctx.rect(0, 0, canvasW, canvasH);
          ctx.closePath();
        }}>
          {doc.layers.map((layer) => {
            if (!layer.visible) return null;
            const draggable = !layer.locked;
            const onSelect = () => setSelectedId(layer.id);
            const onChange = (patch: Partial<Layer>) =>
              updateLayer(layer.id, patch);

            if (layer.type === "rect") {
              return (
                <Rect
                  key={layer.id}
                  id={layer.id}
                  x={layer.x}
                  y={layer.y}
                  width={layer.width}
                  height={layer.height}
                  fill={layer.fill}
                  cornerRadius={layer.cornerRadius}
                  rotation={layer.rotation}
                  opacity={layer.opacity}
                  stroke={layer.stroke}
                  strokeWidth={layer.strokeWidth ?? 0}
                  draggable={draggable}
                  listening={!layer.locked}
                  onClick={onSelect}
                  onTap={onSelect}
                  onDragEnd={(e) =>
                    onChange({ x: e.target.x(), y: e.target.y() })
                  }
                  onTransformEnd={(e) => {
                    const n = e.target as Konva.Rect;
                    const sx = n.scaleX();
                    const sy = n.scaleY();
                    n.scaleX(1);
                    n.scaleY(1);
                    onChange({
                      x: n.x(),
                      y: n.y(),
                      width: Math.max(8, n.width() * sx),
                      height: Math.max(8, n.height() * sy),
                      rotation: n.rotation(),
                    });
                  }}
                />
              );
            }

            if (layer.type === "circle") {
              return (
                <Circle
                  key={layer.id}
                  id={layer.id}
                  x={layer.x}
                  y={layer.y}
                  radius={layer.radius}
                  fill={layer.fill}
                  rotation={layer.rotation}
                  opacity={layer.opacity}
                  stroke={layer.stroke}
                  strokeWidth={layer.strokeWidth ?? 0}
                  draggable={draggable}
                  listening={!layer.locked}
                  onClick={onSelect}
                  onTap={onSelect}
                  onDragEnd={(e) =>
                    onChange({ x: e.target.x(), y: e.target.y() })
                  }
                  onTransformEnd={(e) => {
                    const n = e.target as Konva.Circle;
                    const s = Math.max(n.scaleX(), n.scaleY());
                    n.scaleX(1);
                    n.scaleY(1);
                    onChange({
                      x: n.x(),
                      y: n.y(),
                      radius: Math.max(4, n.radius() * s),
                      rotation: n.rotation(),
                    });
                  }}
                />
              );
            }

            if (layer.type === "text") {
              return (
                <Text
                  key={layer.id}
                  id={layer.id}
                  x={layer.x}
                  y={layer.y}
                  text={layer.text}
                  fontSize={layer.fontSize}
                  fontFamily={layer.fontFamily}
                  fontStyle={
                    `${layer.fontStyle === "italic" ? "italic " : ""}${layer.fontWeight}`.trim()
                  }
                  fill={layer.fill}
                  align={layer.align}
                  width={layer.width}
                  rotation={layer.rotation}
                  opacity={layer.opacity}
                  draggable={draggable}
                  listening={!layer.locked}
                  onClick={onSelect}
                  onTap={onSelect}
                  onDragEnd={(e) =>
                    onChange({ x: e.target.x(), y: e.target.y() })
                  }
                  onTransformEnd={(e) => {
                    const n = e.target as Konva.Text;
                    const sx = n.scaleX();
                    const sy = n.scaleY();
                    n.scaleX(1);
                    n.scaleY(1);
                    onChange({
                      x: n.x(),
                      y: n.y(),
                      fontSize: Math.max(
                        8,
                        Math.round(layer.fontSize * sy),
                      ),
                      width: layer.width
                        ? Math.max(20, layer.width * sx)
                        : undefined,
                      rotation: n.rotation(),
                    });
                  }}
                  onDblClick={() => {
                    // Quick inline text edit via prompt — primitive but reliable
                    const next = window.prompt("Edit text", layer.text);
                    if (next !== null) onChange({ text: next });
                  }}
                  onDblTap={() => {
                    const next = window.prompt("Edit text", layer.text);
                    if (next !== null) onChange({ text: next });
                  }}
                />
              );
            }

            if (layer.type === "image") {
              return (
                <KImage
                  key={layer.id}
                  layer={layer}
                  draggable={draggable}
                  onSelect={onSelect}
                  onChange={onChange}
                />
              );
            }

            return null;
          })}
        </Group>

        {/* Transformer is outside the clipped group so its handles render
            even when the selected node sits right at the canvas edge. */}
        <Transformer
          ref={trRef}
          rotateEnabled
          anchorSize={12}
          anchorStroke="#d0bcff"
          anchorFill="#0b1326"
          anchorCornerRadius={2}
          borderStroke="#d0bcff"
          borderStrokeWidth={1.5}
          borderDash={[]}
          rotateAnchorOffset={28}
          ignoreStroke
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10 || newBox.height < 10) return oldBox;
            return newBox;
          }}
        />
      </KonvaLayer>
    </Stage>
  );
}
