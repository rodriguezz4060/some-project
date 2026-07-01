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

function mapPersonnel(p: Record<string, unknown>): BzvpPersonnel {
  return { ...p, status: toBzvpStatus(p.status as string) } as BzvpPersonnel;
}

export async function getFilteredBzvp(
  statuses: BzvpStatus[],
  query: string,
  arrivalFrom: string,
  arrivalTo: string,
  page = 1,
  pageSize = 8,
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

  const [personnel, count] = await prisma.$transaction([
    prisma.bzvpPersonnel.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.bzvpPersonnel.count({ where }),
  ]);

  return {
    personnel: personnel.map(mapPersonnel),
    count,
  };
}

export async function getBzvpPage(
  statuses: BzvpStatus[],
  query: string,
  arrivalFrom: string,
  arrivalTo: string,
  page: number,
  pageSize = 8,
): Promise<BzvpPersonnel[]> {
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
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return personnel.map(mapPersonnel);
}

export async function getBzvpPersonnelById(id: number): Promise<BzvpPersonnel | null> {
  const p = await prisma.bzvpPersonnel.findUnique({ where: { id } });
  if (!p) return null;
  return { ...p, status: toBzvpStatus(p.status) } as BzvpPersonnel;
}
