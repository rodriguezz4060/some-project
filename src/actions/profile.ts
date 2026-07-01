"use server";

import { auth } from "@root/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@root/lib/prisma";
import { logUpdate } from "@root/lib/audit";
import { updateProfileSchema } from "@root/lib/schemas/profile";
import type { UpdateProfileData } from "@root/lib/schemas/profile";

export async function getProfile() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!user) redirect("/");

  return user;
}

export async function updateProfile(rawData: UpdateProfileData) {
  const session = await auth();
  const parsed = updateProfileSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join("; "));
  }
  const data = parsed.data;
  if (!session?.user) redirect("/");

  const userId = Number(session.user.id);
  const changes: Record<string, { old: string | null; new: string | null }> = {};

  if (data.name !== undefined) {
    const oldName = session.user.name ?? null;
    if (data.name !== oldName) {
      changes.name = { old: oldName, new: data.name };
    }
  }

  if (data.newPassword) {
    if (!data.currentPassword) {
      throw new Error("Введіть поточний пароль");
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) redirect("/");

    const valid = bcrypt.compareSync(data.currentPassword, user.password);
    if (!valid) {
      throw new Error("Неправильний поточний пароль");
    }
    changes.password = { old: "••••••", new: "••••••" };
  }

  if (Object.keys(changes).length === 0) return;

  const updateData: Record<string, string> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.newPassword) {
    updateData.password = await bcrypt.hash(data.newPassword, 10);
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  const desc = Object.entries(changes)
    .map(([key]) => {
      if (key === "name") return "змінив(ла) ім'я";
      if (key === "password") return "змінив(ла) пароль";
      return key;
    })
    .join(", ");

  await logUpdate("User", userId, desc, changes, userId);
  revalidatePath("/profile");
}
