import { prisma } from "@root/lib/prisma";
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

function matchesQuery(person: BzvpPersonnel, query: string): boolean {
  const lower = query.toLowerCase();
  return SEARCH_FIELDS.some((field) => {
    const val = person[field];
    return val != null && String(val).toLowerCase().includes(lower);
  });
}

function toBzvpStatus(s: string): BzvpStatus {
  return s as BzvpStatus;
}

function normalizeDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const m = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return value;
}

export async function getFilteredBzvp(
  statuses: BzvpStatus[],
  query: string,
  arrivalFrom: string,
  arrivalTo: string,
): Promise<{ personnel: BzvpPersonnel[]; count: number }> {
  const all = await prisma.bzvpPersonnel.findMany({
    orderBy: { createdAt: "desc" },
  });

  let filtered = all.map((p) => ({
    ...p,
    status: toBzvpStatus(p.status),
  })) as unknown as BzvpPersonnel[];

  if (statuses.length > 0) {
    filtered = filtered.filter((p) => statuses.includes(p.status));
  }

  if (query) {
    filtered = filtered.filter((p) => matchesQuery(p, query));
  }

  if (arrivalFrom || arrivalTo) {
    filtered = filtered.filter((p) => {
      const d = normalizeDate(p.arrivalDate);
      if (arrivalFrom && d < arrivalFrom) return false;
      if (arrivalTo && d > arrivalTo) return false;
      return true;
    });
  }

  return { personnel: filtered, count: filtered.length };
}

export async function getBzvpPersonnelById(id: number): Promise<BzvpPersonnel | null> {
  const p = await prisma.bzvpPersonnel.findUnique({ where: { id } });
  if (!p) return null;
  return { ...p, status: toBzvpStatus(p.status) } as unknown as BzvpPersonnel;
}
