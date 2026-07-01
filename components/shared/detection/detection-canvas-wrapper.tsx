"use client";

import dynamic from "next/dynamic";
import type { Detection } from "@/generated/prisma/client";

const DetectionCanvasInner = dynamic(
  () => import("./detection-canvas").then((m) => m.DetectionCanvas),
  { ssr: false },
);

interface Props {
  src: string;
  width: number;
  height: number;
  detections: Detection[];
}

export function DetectionCanvasWrapper({ src, width, height, detections }: Props) {
  return (
    <DetectionCanvasInner src={src} width={width} height={height} detections={detections} />
  );
}
