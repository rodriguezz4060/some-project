"use server";

import { prisma } from "@root/lib/prisma";
import { revalidatePath } from "next/cache";
import { logCreate, logUpdate, logDelete } from "@root/lib/audit";
import { requireModerator } from "@root/lib/auth-guards";
import { parseDate } from "@root/lib/utils/dates";
import { compareFields, compareItemArrays, type Changes } from "@root/lib/diff";
import { createMilitarySchema } from "@root/lib/schemas/military";
import type { CreateMilitaryData } from "@root/lib/schemas/military";

const fieldLabels: Record<string, string> = {
  fullName: "ПІБ",
  rank: "Звання",
  position: "Посада",
  unit: "Підрозділ",
  status: "Статус",
  birthDate: "Дата народження",
  phone: "Телефон",
  email: "Email",
  experience: "Досвід (років)",
  missions: "Кількість виходів",
  lastActiveDays: "Остання активність (днів)",
  photo: "Фото",
  name: "Назва",
  type: "Тип",
  serialNumber: "Серійний номер",
  issuedDate: "Дата видачі",
  condition: "Діагноз",
  diagnosisDate: "Дата діагнозу",
  notes: "Примітки",
  description: "Опис",
  date: "Дата",
  startDate: "Дата початку",
  endDate: "Дата закінчення",
  height: "Зріст",
  chest: "Обхват грудей",
  waist: "Обхват талії",
  shoes: "Розмір взуття",
  headgear: "Розмір головного убору",
  uniform: "Розмір форми",
};

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

    await logCreate(
      "MilitaryPersonnel",
      person.id,
      `Створив анкету військовослужбовця «${person.fullName}»`,
      userId,
    );

    revalidatePath("/military");
    return { id: person.id, fullName: person.fullName };
  } catch {
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

    async function syncItems<T extends { id?: number | null }>(
      deleteMany: (args: { where: { id: { in: number[] } } }) => Promise<unknown>,
      createMany: (args: { data: Record<string, unknown>[] }) => Promise<unknown>,
      update: (args: { where: { id: number }; data: Record<string, unknown> }) => Promise<unknown>,
      oldItems: ({ id: number } & Record<string, unknown>)[],
      newItems: T[],
      extraFields: Record<string, unknown>,
    ) {
      const newIds = new Set(newItems.map((item) => item.id).filter(Boolean) as number[]);
      const toDelete = oldItems.filter((item) => !newIds.has(item.id)).map((item) => item.id);

      if (toDelete.length > 0) {
        await deleteMany({ where: { id: { in: toDelete } } });
      }

      const toCreate: Record<string, unknown>[] = [];
      for (const item of newItems) {
        const { id: itemId, ...fields } = item as Record<string, unknown>;
        if (itemId && oldItems.some((o) => o.id === itemId)) {
          await update({ where: { id: itemId as number }, data: fields });
        } else {
          toCreate.push({ ...extraFields, ...fields });
        }
      }
      if (toCreate.length > 0) {
        await createMany({ data: toCreate });
      }
    }

    if (medicalRecords && oldPerson) {
      await syncItems(
        prisma.medicalRecord.deleteMany.bind(prisma.medicalRecord),
        prisma.medicalRecord.createMany.bind(prisma.medicalRecord),
        prisma.medicalRecord.update.bind(prisma.medicalRecord),
        oldPerson.medicalRecords,
        medicalRecords,
        { personnelId: id },
      );
    }

    if (achievements && oldPerson) {
      await syncItems(
        prisma.achievement.deleteMany.bind(prisma.achievement),
        prisma.achievement.createMany.bind(prisma.achievement),
        prisma.achievement.update.bind(prisma.achievement),
        oldPerson.achievements,
        achievements,
        { personnelId: id },
      );
    }

    if (equipment && oldPerson) {
      await syncItems(
        prisma.equipment.deleteMany.bind(prisma.equipment),
        prisma.equipment.createMany.bind(prisma.equipment),
        prisma.equipment.update.bind(prisma.equipment),
        oldPerson.equipment,
        equipment,
        { personnelId: id },
      );
    }

    if (positionHistory && oldPerson) {
      await syncItems(
        prisma.positionEntry.deleteMany.bind(prisma.positionEntry),
        prisma.positionEntry.createMany.bind(prisma.positionEntry),
        prisma.positionEntry.update.bind(prisma.positionEntry),
        oldPerson.positionHistory,
        positionHistory,
        { personnelId: id },
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
        oldPerson as Record<string, unknown>,
        data as Record<string, unknown>,
        ["fullName", "rank", "position", "unit", "status", "birthDate", "phone", "email", "experience", "missions", "lastActiveDays"],
        fieldLabels,
      );
      for (const [key, val] of Object.entries(mainFieldChanges)) {
        allChanges[key] = val;
        allDescriptions.push(
          `змінив «${key}» з «${val.old ?? ""}» на «${val.new ?? ""}»`,
        );
      }

      if (medicalRecords) {
        const result = compareItemArrays(
          oldPerson.medicalRecords as Record<string, unknown>[],
          medicalRecords as Record<string, unknown>[],
          "Медицина",
          fieldLabels,
        );
        Object.assign(allChanges, result.changes);
        allDescriptions.push(...result.descriptions);
      }

      if (achievements) {
        const result = compareItemArrays(
          oldPerson.achievements as Record<string, unknown>[],
          achievements as Record<string, unknown>[],
          "Нагороди",
          fieldLabels,
        );
        Object.assign(allChanges, result.changes);
        allDescriptions.push(...result.descriptions);
      }

      if (equipment) {
        const result = compareItemArrays(
          oldPerson.equipment as Record<string, unknown>[],
          equipment as Record<string, unknown>[],
          "Спорядження",
          fieldLabels,
        );
        Object.assign(allChanges, result.changes);
        allDescriptions.push(...result.descriptions);
      }

      if (positionHistory) {
        const result = compareItemArrays(
          oldPerson.positionHistory as Record<string, unknown>[],
          positionHistory as Record<string, unknown>[],
          "Історія посад",
          fieldLabels,
        );
        Object.assign(allChanges, result.changes);
        allDescriptions.push(...result.descriptions);
      }

      if (clothingSizes && oldPerson.clothingSizes) {
        const result = compareFields(
          oldPerson.clothingSizes as Record<string, unknown>,
          clothingSizes as Record<string, unknown>,
          ["height", "chest", "waist", "shoes", "headgear", "uniform"],
          fieldLabels,
        );
        Object.assign(allChanges, result);
        for (const [key, val] of Object.entries(result)) {
          allDescriptions.push(
            `змінив «${key}» з «${val.old ?? ""}» на «${val.new ?? ""}»`,
          );
        }
      }
    }

    const fullName = person.fullName;
    let description: string;
    if (allDescriptions.length === 0) {
      description = `Вніс зміни в анкету «${fullName}» (без змін у даних)`;
    } else if (allDescriptions.length <= 3) {
      description = `Зміни в картці «${fullName}»: ${allDescriptions.join("; ")}`;
    } else {
      description = `Зміни в картці «${fullName}»: ${allDescriptions.slice(0, 3).join("; ")} та ще ${allDescriptions.length - 3} змін`;
    }

    if (Object.keys(allChanges).length > 0) {
      await logUpdate("MilitaryPersonnel", id, description, allChanges, userId);
    }

    revalidatePath("/military");
    revalidatePath(`/military/${id}`);
    return { id: person.id, fullName: person.fullName };
  } catch {
    throw new Error("Помилка при збереженні");
  }
}

export async function deleteMilitary(id: number) {
  const session = await requireModerator();
  const userId = Number(session.user.id);

  try {
    const person = await prisma.militaryPersonnel.delete({ where: { id } });

    await logDelete(
      "MilitaryPersonnel",
      id,
      `Видалив анкету військовослужбовця «${person.fullName}»`,
      userId,
    );

    revalidatePath("/military");
    return { id: person.id, fullName: person.fullName };
  } catch {
    throw new Error("Помилка при видаленні");
  }
}
