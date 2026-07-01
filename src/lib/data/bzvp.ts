import { prisma } from "@root/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { BzvpPersonnel, BzvpStatus } from "@/components/shared/bzvp/types";

const SEARCH_FIELDS: (keyof BzvpPersonnel)[] = [
  "fullName",
  "rank",
  "serviceUnit",
  "specialization",
  "phone",
  "education",
  "civilianJob",
];

function toBzvpStatus(s: string): BzvpStatus {
  return s as BzvpStatus;
}

export async function getFilteredBzvp(
  statuses: BzvpStatus[],
  query: string,
  arrivalFrom: string,
  arrivalTo: string,
): Promise<{ personnel: BzvpPersonnel[]; count: number }> {
  const where: Prisma.BzvpPersonnelWhereInput = {};

  if (statuses.length > 0) {
    where.status = { in: statuses };
  }

  if (query) {
    where.OR = SEARCH_FIELDS.map((field) => ({
      [field]: { contains: query, mode: "insensitive" },
    })) as Prisma.BzvpPersonnelWhereInput[];
  }

  if (arrivalFrom || arrivalTo) {
    const dateFilter: Prisma.StringFilter<"BzvpPersonnel"> = {};
    if (arrivalFrom) dateFilter.gte = arrivalFrom;
    if (arrivalTo) dateFilter.lte = arrivalTo;
    where.arrivalDate = dateFilter;
  }

  const personnel = await prisma.bzvpPersonnel.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return {
    personnel: personnel.map((p) => ({
      ...p,
      status: toBzvpStatus(p.status),
    })) as BzvpPersonnel[],
    count: personnel.length,
  };
}

export async function getBzvpPersonnelById(id: number): Promise<BzvpPersonnel | null> {
  const p = await prisma.bzvpPersonnel.findUnique({ where: { id } });
  if (!p) return null;
  return { ...p, status: toBzvpStatus(p.status) } as BzvpPersonnel;
}
