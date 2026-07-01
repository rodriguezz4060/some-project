import { prisma } from "@root/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { MilitaryPersonnel, StatusType } from "@/components/shared/military/types";

const MAX_FETCH = 200;
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
    id: raw.id as number,
    fullName: raw.fullName as string,
    rank: raw.rank as MilitaryPersonnel["rank"],
    position: raw.position as string,
    unit: raw.unit as string,
    status: raw.status as StatusType,
    birthDate: raw.birthDate as string,
    photo: raw.photo as string | undefined,
    experience: raw.experience as number | undefined,
    missions: raw.missions as number | undefined,
    phone: raw.phone as string | undefined,
    email: raw.email as string | undefined,
    lastActiveDays: raw.lastActiveDays as number | undefined,
    medicalRecords: raw.medicalRecords as MilitaryPersonnel["medicalRecords"],
    achievements: raw.achievements as MilitaryPersonnel["achievements"],
    equipment: raw.equipment as MilitaryPersonnel["equipment"],
    positionHistory: raw.positionHistory as MilitaryPersonnel["positionHistory"],
    clothingSizes: raw.clothingSizes as MilitaryPersonnel["clothingSizes"],
  };
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
      take: MAX_FETCH,
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
      positionHistory: { orderBy: { startDate: "desc" } },
      clothingSizes: true,
    },
  });

  if (!p) return null;
  return toMilitaryPersonnel(p);
}

export async function getAllMilitary(): Promise<MilitaryPersonnel[]> {
  const all = await prisma.militaryPersonnel.findMany({
    orderBy: { createdAt: "desc" },
    take: MAX_FETCH,
    include: {
      medicalRecords: true,
      achievements: true,
      equipment: true,
      positionHistory: { orderBy: { startDate: "desc" } },
      clothingSizes: true,
    },
  });

  return all.map(toMilitaryPersonnel);
}

export async function getMilitaryStats() {
  const [statusCounts, replacementCount, personnel] = await Promise.all([
    prisma.militaryPersonnel.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.militaryPersonnel.count({
      where: { lastActiveDays: { gt: 14 } },
    }),
    prisma.militaryPersonnel.findMany({
      select: {
        id: true,
        fullName: true,
        rank: true,
        status: true,
        missions: true,
        lastActiveDays: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalCount = personnel.length;

  return {
    statusCounts,
    replacementCount,
    totalCount,
    personnel: personnel as MilitaryPersonnel[],
  };
}
