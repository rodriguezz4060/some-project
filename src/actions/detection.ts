"use server";

import { prisma } from "@root/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@root/lib/auth";
import { redirect } from "next/navigation";
import fs from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "detections");

export async function getPhotos(page = 1, pageSize = 20) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const [photos, total] = await Promise.all([
    prisma.photo.findMany({
      include: { detections: true, uploader: { select: { name: true } } },
      orderBy: { uploadedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.photo.count(),
  ]);

  return { photos, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getPhoto(id: number) {
  const session = await auth();
  if (!session?.user) redirect("/");

  return prisma.photo.findUnique({
    where: { id },
    include: { detections: true, uploader: { select: { name: true } } },
  });
}

export async function deletePhoto(id: number) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) throw new Error("Photo not found");

  const filePath = path.join(UPLOAD_DIR, photo.filename);
  await fs.unlink(filePath).catch(() => {});

  await prisma.photo.delete({ where: { id } });
  revalidatePath("/military/detection");
}
