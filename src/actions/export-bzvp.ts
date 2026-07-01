"use server";

import { prisma } from "@root/lib/prisma";
import { requireModerator } from "@root/lib/auth-guards";

export async function exportBzvpData(
  fields: string[],
  createdFrom?: string,
  createdTo?: string,
) {
  await requireModerator();

  const data = await prisma.bzvpPersonnel.findMany({
    take: 5000,
    where: {
      ...(createdFrom || createdTo
        ? {
            createdAt: {
              ...(createdFrom ? { gte: new Date(createdFrom) } : {}),
              ...(createdTo ? { lte: new Date(createdTo + "T23:59:59.999Z") } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return data.map((row) => {
    const obj: Record<string, unknown> = {};
    for (const field of fields) {
      const val = (row as Record<string, unknown>)[field];
      if (val instanceof Date) {
        obj[field] = val.toISOString().split("T")[0];
      } else {
        obj[field] = val ?? "";
      }
    }
    return obj;
  });
}
