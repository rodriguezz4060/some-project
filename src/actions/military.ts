"use server";

import { prisma } from "@root/lib/prisma";
import { revalidatePath } from "next/cache";
import { logCreate, logUpdate, logDelete } from "@root/lib/audit";
import { requireModerator } from "@root/lib/auth-guards";
import { parseDate } from "@root/lib/utils/dates";
import { syncItems } from "@root/lib/sync-items";
import { compareFields, compareItemArrays, type Changes } from "@root/lib/diff";
import { buildChangeLines, formatDescription } from "@root/lib/audit-helpers";
import { fieldLabels } from "@root/lib/action-labels";
import { getMilitaryPage as getMilitaryPageData } from "@root/lib/data/military";
import { createMilitarySchema } from "@root/lib/schemas/military";
import type { CreateMilitaryData } from "@root/lib/schemas/military";
import type { StatusType } from "@/components/shared/military/types";
import type { MilitaryPersonnel } from "@/components/shared/military/types";

function parseMilitary(rawData: CreateMilitaryData) {
  const parsed = createMilitarySchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join("; "));
  }
  return parsed.data;
}

function autoFillEndDates(history: { startDate: string; endDate?: string | null }[]): void {
  const sorted = [...history].sort((a, b) => parseDate(a.startDate) - parseDate(b.startDate));
  sorted.forEach((entry, i) => {
    if (!entry.endDate && i < sorted.length - 1) {
      entry.endDate = sorted[i + 1].startDate;
    }
  });
}

export async function createMilitary(rawData: CreateMilitaryData) {
  const session = await requireModerator();
  const userId = Number(session.user.id);
  const data = parseMilitary(rawData);
  if (data.positionHistory) autoFillEndDates(data.positionHistory);
  const { medicalRecords, achievements, equipment, positionHistory, clothingSizes, ...flat } = data;

  try {
    const person = await prisma.militaryPersonnel.create({
      data: {
        ...flat,
        medicalRecords: medicalRecords?.length ? { createMany: { data: medicalRecords } } : undefined,
        achievements: achievements?.length ? { createMany: { data: achievements } } : undefined,
        equipment: equipment?.length ? { createMany: { data: equipment } } : undefined,
        positionHistory: positionHistory?.length ? { createMany: { data: positionHistory } } : undefined,
        clothingSizes: clothingSizes ? { create: { ...clothingSizes } } : undefined,
      },
    });

    logCreate(
      "MilitaryPersonnel",
      person.id,
      `Створив анкету військовослужбовця «${person.fullName}»`,
      userId,
    );

    revalidatePath("/military");
    return { id: person.id, fullName: person.fullName };
  } catch (e) {
    console.error("createMilitary failed:", e);
    throw new Error("Помилка при збереженні");
  }
}

export async function updateMilitary(id: number, rawData: CreateMilitaryData) {
  const session = await requireModerator();
  const userId = Number(session.user.id);
  const data = parseMilitary(rawData);
  if (data.positionHistory) autoFillEndDates(data.positionHistory);

  try {
    const oldPerson = await prisma.militaryPersonnel.findUnique({
      where: { id },
      include: {
        equipment: true,
        medicalRecords: true,
        achievements: true,
        positionHistory: true,
        clothingSizes: true,
      },
    });

    const { medicalRecords, achievements, equipment, positionHistory, clothingSizes, ...flat } = data;

    const person = await prisma.militaryPersonnel.update({ where: { id }, data: flat });

    if (medicalRecords && oldPerson) {
      const withFk = medicalRecords.map((r) => ({ ...r, personnelId: id }));
      await syncItems(
        (ids) => prisma.medicalRecord.deleteMany({ where: { id: { in: ids } } }),
        (data) => prisma.medicalRecord.createMany({ data }),
        (itemId, data) => prisma.medicalRecord.update({ where: { id: itemId }, data }),
        oldPerson.medicalRecords,
        withFk,
      );
    }

    if (achievements && oldPerson) {
      const withFk = achievements.map((r) => ({ ...r, personnelId: id }));
      await syncItems(
        (ids) => prisma.achievement.deleteMany({ where: { id: { in: ids } } }),
        (data) => prisma.achievement.createMany({ data }),
        (itemId, data) => prisma.achievement.update({ where: { id: itemId }, data }),
        oldPerson.achievements,
        withFk,
      );
    }

    if (equipment && oldPerson) {
      const withFk = equipment.map((r) => ({ ...r, personnelId: id }));
      await syncItems(
        (ids) => prisma.equipment.deleteMany({ where: { id: { in: ids } } }),
        (data) => prisma.equipment.createMany({ data }),
        (itemId, data) => prisma.equipment.update({ where: { id: itemId }, data }),
        oldPerson.equipment,
        withFk,
      );
    }

    if (positionHistory && oldPerson) {
      const withFk = positionHistory.map((r) => ({ ...r, personnelId: id }));
      await syncItems(
        (ids) => prisma.positionEntry.deleteMany({ where: { id: { in: ids } } }),
        (data) => prisma.positionEntry.createMany({ data }),
        (itemId, data) => prisma.positionEntry.update({ where: { id: itemId }, data }),
        oldPerson.positionHistory,
        withFk,
      );
    }

    if (clothingSizes) {
      await prisma.clothingSizes.upsert({
        where: { personnelId: id },
        update: { ...clothingSizes },
        create: { personnelId: id, ...clothingSizes },
      });
    }

    const allChanges: Changes = {};
    const allDescriptions: string[] = [];

    if (oldPerson) {
      const mainFieldChanges = compareFields(
        oldPerson,
        data,
        ["fullName", "rank", "position", "unit", "status", "birthDate", "phone", "email", "experience", "missions", "lastActiveDays"],
        fieldLabels,
      );
      Object.assign(allChanges, mainFieldChanges);
      allDescriptions.push(...buildChangeLines(mainFieldChanges));

      if (medicalRecords) {
        const result = compareItemArrays(
          oldPerson.medicalRecords,
          medicalRecords,
          "Медицина",
          fieldLabels,
        );
        Object.assign(allChanges, result.changes);
        allDescriptions.push(...result.descriptions);
      }

      if (achievements) {
        const result = compareItemArrays(
          oldPerson.achievements,
          achievements,
          "Нагороди",
          fieldLabels,
        );
        Object.assign(allChanges, result.changes);
        allDescriptions.push(...result.descriptions);
      }

      if (equipment) {
        const result = compareItemArrays(
          oldPerson.equipment,
          equipment,
          "Спорядження",
          fieldLabels,
        );
        Object.assign(allChanges, result.changes);
        allDescriptions.push(...result.descriptions);
      }

      if (positionHistory) {
        const result = compareItemArrays(
          oldPerson.positionHistory,
          positionHistory,
          "Історія посад",
          fieldLabels,
        );
        Object.assign(allChanges, result.changes);
        allDescriptions.push(...result.descriptions);
      }

      if (clothingSizes && oldPerson.clothingSizes) {
        const clothingChanges = compareFields(
          oldPerson.clothingSizes,
          clothingSizes,
          ["height", "chest", "waist", "shoes", "headgear", "uniform"],
          fieldLabels,
        );
        Object.assign(allChanges, clothingChanges);
        allDescriptions.push(...buildChangeLines(clothingChanges));
      }
    }

    const fullName = person.fullName;
    const description = formatDescription(
      allDescriptions,
      "Зміни в картці",
      fullName,
      `Вніс зміни в анкету «${fullName}» (без змін у даних)`,
    );

    if (Object.keys(allChanges).length > 0) {
      logUpdate("MilitaryPersonnel", id, description, allChanges, userId);
    }

    revalidatePath("/military");
    revalidatePath(`/military/${id}`);
    return { id: person.id, fullName: person.fullName };
  } catch (e) {
    console.error("updateMilitary failed:", e);
    throw new Error("Помилка при збереженні");
  }
}

export async function deleteMilitary(id: number) {
  const session = await requireModerator();
  const userId = Number(session.user.id);

  try {
    const person = await prisma.militaryPersonnel.delete({ where: { id } });

    logDelete(
      "MilitaryPersonnel",
      id,
      `Видалив анкету військовослужбовця «${person.fullName}»`,
      userId,
    );

    revalidatePath("/military");
    return { id: person.id, fullName: person.fullName };
  } catch (e) {
    console.error("deleteMilitary failed:", e);
    throw new Error("Помилка при видаленні");
  }
}

export async function getMilitaryPage(
  statuses: StatusType[],
  query: string,
  page: number,
): Promise<MilitaryPersonnel[]> {
  return getMilitaryPageData(statuses, query, page);
}
