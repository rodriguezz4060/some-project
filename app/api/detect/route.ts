import { NextRequest, NextResponse } from "next/server";
import { auth } from "@root/lib/auth";
import { prisma } from "@root/lib/prisma";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "detections");
const DETECTOR_URL = process.env.DETECTOR_URL;
const API_KEY = process.env.ULTALYTICS_API_KEY;

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 20 * 1024 * 1024;

interface UltralyticsResult {
  name: string;
  confidence: number;
  box: { x1: number; y1: number; x2: number; y2: number };
}

interface UltralyticsImage {
  shape: [number, number];
  results: UltralyticsResult[];
}

interface UltralyticsResponse {
  images: UltralyticsImage[];
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!DETECTOR_URL || !API_KEY) {
    return NextResponse.json(
      { error: "Detector not configured (missing DETECTOR_URL or ULTALYTICS_API_KEY)" },
      { status: 500 },
    );
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

  const cloudForm = new FormData();
  cloudForm.set("file", new Blob([buffer], { type: file.type }), file.name);
  cloudForm.set("conf", "0.1");
  cloudForm.set("iou", "0.4");

  let responseJson: UltralyticsResponse;

  try {
    const res = await fetch(DETECTOR_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}` },
      body: cloudForm,
    });

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json(
        { error: `Detector returned ${res.status}: ${body || res.statusText}` },
        { status: 502 },
      );
    }

    responseJson = await res.json();
  } catch {
    return NextResponse.json({ error: "Detector unavailable" }, { status: 503 });
  }

  const image = responseJson.images?.[0];
  if (!image) {
    return NextResponse.json({ error: "Detector returned empty result" }, { status: 502 });
  }

  const [height, width] = image.shape;

  const detections = image.results.map((r) => ({
    label: r.name,
    confidence: Math.round(r.confidence * 10000) / 10000,
    x1: Math.round(r.box.x1 * 10) / 10,
    y1: Math.round(r.box.y1 * 10) / 10,
    x2: Math.round(r.box.x2 * 10) / 10,
    y2: Math.round(r.box.y2 * 10) / 10,
  }));

  const filePath = path.join(UPLOAD_DIR, uniqueName);
  await writeFile(filePath, buffer);

  const photo = await prisma.photo.create({
    data: {
      filename: uniqueName,
      original: file.name,
      width,
      height,
      uploaderId: Number(session.user.id),
      detections: { create: detections },
    },
    include: { detections: true },
  });

  return NextResponse.json({ photoId: photo.id, detections: photo.detections });
}
