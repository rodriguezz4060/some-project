"use server";

import { prisma } from "@root/lib/prisma";
import { requireModerator } from "@root/lib/auth-guards";

const ALLOWED_FIELDS = new Set([
  "fullName", "rank", "birthDate", "birthPlace", "photo",
  "passport", "passportIssued", "tin", "militaryId", "militaryIdIssued",
  "ubd", "ubdDate", "serviceUnit", "serviceYears", "civilianJob",
  "education", "actualAddress", "registrationAddress", "driverLicense",
  "criminalRecord", "policeRecords", "family", "phone", "relativePhones",
  "personalOrder", "conscription", "health", "healthComplaints",
  "moralState", "bloodType", "shoeSize", "notes", "status",
  "arrivalDate", "trainingPeriod", "specialization",
]);

export async function exportBzvpData(
  fields: string[],
  createdFrom?: string,
  createdTo?: string,
) {
  await requireModerator();

  const safeFields = fields.filter((f) => ALLOWED_FIELDS.has(f));

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
    for (const field of safeFields) {
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
