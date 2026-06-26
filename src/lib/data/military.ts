import { prisma } from "@root/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { MilitaryPersonnel, StatusType } from "@/components/shared/military/types";

const SEARCH_FIELDS: (keyof MilitaryPersonnel)[] = [
  "fullName",
  "rank",
  "position",
  "unit",
  "phone",
  "email",
];

function toMilitaryPersonnel(raw: Record<string, unknown>): MilitaryPersonnel {
  return {
    ...raw,
    rank: raw.rank as MilitaryPersonnel["rank"],
    status: raw.status as StatusType,
    medicalRecords: (raw.medicalRecords as unknown[]) ?? undefined,
    achievements: (raw.achievements as unknown[]) ?? undefined,
    equipment: (raw.equipment as unknown[]) ?? undefined,
    positionHistory: (raw.positionHistory as unknown[]) ?? undefined,
    clothingSizes: raw.clothingSizes ?? undefined,
  } as unknown as MilitaryPersonnel;
}

export async function getTotalMilitaryCount(): Promise<number> {
  return prisma.militaryPersonnel.count();
}

export async function getFilteredMilitary(
  statuses: StatusType[],
  query: string,
): Promise<{ personnel: MilitaryPersonnel[]; totalCount: number }> {
  const where: Prisma.MilitaryPersonnelWhereInput = {};

  if (statuses.length > 0) {
    where.status = { in: statuses };
  }

  if (query) {
    where.OR = SEARCH_FIELDS.map((field) => ({
      [field]: { contains: query, mode: "insensitive" },
    })) as Prisma.MilitaryPersonnelWhereInput[];
  }

  const [personnel, totalCount] = await Promise.all([
    prisma.militaryPersonnel.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    prisma.militaryPersonnel.count(),
  ]);

  return {
    personnel: personnel.map(toMilitaryPersonnel),
    totalCount,
  };
}

export async function getMilitaryPersonnelById(id: number): Promise<MilitaryPersonnel | null> {
  const p = await prisma.militaryPersonnel.findUnique({
    where: { id },
    include: {
      medicalRecords: true,
      achievements: true,
      equipment: true,
      positionHistory: true,
      clothingSizes: true,
    },
  });

  if (!p) return null;
  return toMilitaryPersonnel(p);
}

export async function getAllMilitary(): Promise<MilitaryPersonnel[]> {
  const all = await prisma.militaryPersonnel.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      medicalRecords: true,
      achievements: true,
      equipment: true,
      positionHistory: true,
      clothingSizes: true,
    },
  });

  return all.map(toMilitaryPersonnel);
}
