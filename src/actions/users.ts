"use server";

import { prisma } from "@root/lib/prisma";
import { auth } from "@root/lib/auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createUserSchema, updateUserSchema } from "@root/lib/schemas/users";
import type { CreateUserData, UpdateUserData } from "@root/lib/schemas/users";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
  return session;
}

export async function getUsers(params?: {
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireAdmin();

  const { query, page = 1, pageSize = 20 } = params ?? {};
  const skip = (page - 1) * pageSize;

  const where = query
    ? {
        OR: [
          { email: { contains: query, mode: "insensitive" as const } },
          { name: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, totalPages: Math.ceil(total / pageSize) };
}

export async function createUser(rawData: CreateUserData) {
  await requireAdmin();
  const parsed = createUserSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join("; "));
  }
  const data = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) {
    throw new Error("Користувач з такою електронною поштою вже існує");
  }

  const hashed = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashed,
      role: data.role,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return user;
}

export async function updateUser(
  id: number,
  rawData: UpdateUserData,
) {
  const session = await requireAdmin();
  const parsed = updateUserSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join("; "));
  }
  const data = parsed.data;

  if (Number(session.user.id) === id && data.role && data.role !== "admin") {
    throw new Error("Ви не можете змінити власну роль");
  }

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, name: true, role: true, updatedAt: true },
  });
}

export async function deleteUser(id: number) {
  const session = await requireAdmin();

  if (Number(session.user.id) === id) {
    throw new Error("Ви не можете видалити себе");
  }

  await prisma.user.delete({ where: { id } });
}
