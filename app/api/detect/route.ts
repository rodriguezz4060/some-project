import { NextRequest, NextResponse } from "next/server";
import { auth } from "@root/lib/auth";
import { prisma } from "@root/lib/prisma";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "detections");
const DETECTOR_URL = "http://localhost:8000/detect";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 20 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP allowed" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const uniqueName = `${crypto.randomUUID()}.${ext}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const detectorForm = new FormData();
  detectorForm.set("file", new Blob([buffer], { type: file.type }), file.name);

  let detectorResult: {
    success: boolean;
    width: number;
    height: number;
    detections: Array<{
      label: string;
      confidence: number;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }>;
  };

  try {
    const res = await fetch(DETECTOR_URL, {
      method: "POST",
      body: detectorForm,
    });
    detectorResult = await res.json();
  } catch {
    return NextResponse.json({ error: "Detector unavailable" }, { status: 503 });
  }

  const filePath = path.join(UPLOAD_DIR, uniqueName);
  await writeFile(filePath, buffer);

  const photo = await prisma.photo.create({
    data: {
      filename: uniqueName,
      original: file.name,
      width: detectorResult.width,
      height: detectorResult.height,
      uploaderId: Number(session.user.id),
      detections: {
        create: detectorResult.detections.map((d) => ({
          label: d.label,
          confidence: d.confidence,
          x1: d.x1,
          y1: d.y1,
          x2: d.x2,
          y2: d.y2,
        })),
      },
    },
    include: { detections: true },
  });

  return NextResponse.json({ photoId: photo.id, detections: photo.detections });
}
