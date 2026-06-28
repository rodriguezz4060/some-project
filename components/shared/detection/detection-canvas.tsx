"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import PhotoSwipe from "photoswipe";
import "photoswipe/dist/photoswipe.css";
import type { Detection } from "@/generated/prisma/client";
import { getDetectionColor } from "@root/lib/detection-colors";

interface Props {
  src: string;
  width: number;
  height: number;
  detections: Detection[];
}

function drawAnnotations(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  detections: Detection[],
) {
  const lineWidth = Math.max(2, Math.round(w / 300));
  const fontSize = Math.max(13, Math.round(w / 50));

  ctx.font = `bold ${fontSize}px sans-serif`;

  for (const d of detections) {
    const color = getDetectionColor(d.label);
    const x = d.x1;
    const y = d.y1;
    const bw = d.x2 - d.x1;
    const bh = d.y2 - d.y1;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, bw, bh);

    const label = `${d.label} ${Math.round(d.confidence * 100)}%`;
    const textWidth = ctx.measureText(label).width;
    const pad = 4;

    ctx.fillStyle = color;
    ctx.fillRect(x, y - fontSize - pad * 2, textWidth + pad * 2, fontSize + pad * 2);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x + pad, y - pad);
  }
}

export function DetectionCanvas({ src, width, height, detections }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoaded(false);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.decode().then(() => {
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      drawAnnotations(ctx, width, height, detections);
      setLoaded(true);
    }).catch(() => {});
  }, [src, width, height, detections]);

  const handleClick = useCallback(async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("no canvas");

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("canvas toBlob failed"));
        }, "image/jpeg", 0.8);
      });
      const blobUrl = URL.createObjectURL(blob);

      const pswp = new PhotoSwipe({
        dataSource: [{ src: blobUrl, width, height }],
        showHideAnimationType: "fade",
        bgOpacity: 0.95,
      });

      pswp.on("destroy", () => {
        URL.revokeObjectURL(blobUrl);
      });

      pswp.init();
    } catch {
      window.open(src, "_blank");
    }
  }, [src, width, height]);

  return (
    <div
      className="relative inline-block max-w-full rounded-lg overflow-hidden cursor-zoom-in"
      style={{ width: Math.min(width, 1200) }}
      onClick={handleClick}
    >
      {!loaded && (
        <div className="absolute inset-0 w-full h-full animate-pulse rounded-lg bg-muted" />
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-auto transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ aspectRatio: `${width} / ${height}`, display: "block" }}
      />
    </div>
  );
}
