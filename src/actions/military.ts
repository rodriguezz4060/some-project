"use server";

import { prisma } from "@root/lib/prisma";
import { revalidatePath } from "next/cache";
import { logCreate, logUpdate, logDelete } from "@root/lib/audit";
import { auth } from "@root/lib/auth";
import { redirect } from "next/navigation";
import { createMilitarySchema } from "@root/lib/schemas/military";
import type { CreateMilitaryData } from "@root/lib/schemas/military";

async function requireModerator() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "moderator")) {
    redirect("/");
  }
}

type Changes = Record<string, { old: string | null; new: string | null }>;

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

function getLabel(key: string): string {
  return fieldLabels[key] ?? key;
}

function parseMilitary(rawData: CreateMilitaryData) {
  const parsed = createMilitarySchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join("; "));
  }
  return parsed.data;
}

function compareFields(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
  fields: string[],
): Changes {
  const changes: Changes = {};
  for (const field of fields) {
    const oldVal = oldData[field];
    const newVal = newData[field];
    const oldStr = oldVal == null ? "" : String(oldVal);
    const newStr = newVal == null ? "" : String(newVal);
    if (oldStr !== newStr) {
      changes[getLabel(field)] = { old: oldStr || null, new: newStr || null };
    }
  }
  return changes;
}

function compareItemArrays(
  oldItems: Record<string, unknown>[],
  newItems: Record<string, unknown>[],
  label: string,
): { changes: Changes; descriptions: string[] } {
  const changes: Changes = {};
  const descriptions: string[] = [];
  const excludeKeys = new Set(["id", "personnelId"]);

  if (oldItems.length < newItems.length) {
    descriptions.push(`додано ${newItems.length - oldItems.length} записів у «${label}»`);
  } else if (oldItems.length > newItems.length) {
    descriptions.push(`видалено ${oldItems.length - newItems.length} записів з «${label}»`);
  }

  const compareCount = Math.min(oldItems.length, newItems.length);
  for (let i = 0; i < compareCount; i++) {
    const oldItem = oldItems[i] ?? {};
    const newItem = newItems[i] ?? {};
    const allKeys = [...new Set([...Object.keys(oldItem), ...Object.keys(newItem)])];
    for (const key of allKeys) {
      if (excludeKeys.has(key)) continue;
      const oldVal = String(oldItem[key] ?? "");
      const newVal = String(newItem[key] ?? "");
      if (oldVal !== newVal) {
        const changeKey = `${label} №${i + 1} / ${getLabel(key)}`;
        changes[changeKey] = { old: oldVal || null, new: newVal || null };
        descriptions.push(
          `змінив «${getLabel(key)}» в «${label}» №${i + 1} з «${oldVal}» на «${newVal}»`,
        );
      }
    }
  }

  return { changes, descriptions };
}

export async function createMilitary(rawData: CreateMilitaryData) {
  await requireModerator();
  const data = parseMilitary(rawData);
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
    );

    revalidatePath("/military");
    return { id: person.id, fullName: person.fullName };
  } catch {
    throw new Error("Помилка при збереженні");
  }
}

export async function updateMilitary(id: number, rawData: CreateMilitaryData) {
  await requireModerator();
  const data = parseMilitary(rawData);

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

    if (medicalRecords) {
      await prisma.medicalRecord.deleteMany({ where: { personnelId: id } });
      if (medicalRecords.length > 0) {
        await prisma.medicalRecord.createMany({
          data: medicalRecords.map((r) => ({ personnelId: id, ...r })),
        });
      }
    }

    if (achievements) {
      await prisma.achievement.deleteMany({ where: { personnelId: id } });
      if (achievements.length > 0) {
        await prisma.achievement.createMany({
          data: achievements.map((a) => ({ personnelId: id, ...a })),
        });
      }
    }

    if (equipment) {
      await prisma.equipment.deleteMany({ where: { personnelId: id } });
      if (equipment.length > 0) {
        await prisma.equipment.createMany({
          data: equipment.map((e) => ({ personnelId: id, ...e })),
        });
      }
    }

    if (positionHistory) {
      await prisma.positionEntry.deleteMany({ where: { personnelId: id } });
      if (positionHistory.length > 0) {
        await prisma.positionEntry.createMany({
          data: positionHistory.map((p) => ({ personnelId: id, ...p })),
        });
      }
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
        oldPerson as unknown as Record<string, unknown>,
        data as unknown as Record<string, unknown>,
        ["fullName", "rank", "position", "unit", "status", "birthDate", "phone", "email", "experience", "missions", "lastActiveDays"],
      );
      for (const [key, val] of Object.entries(mainFieldChanges)) {
        allChanges[key] = val;
        allDescriptions.push(
          `змінив «${getLabel(key)}» з «${val.old ?? ""}» на «${val.new ?? ""}»`,
        );
      }

      if (medicalRecords) {
        const result = compareItemArrays(
          oldPerson.medicalRecords as unknown as Record<string, unknown>[],
          medicalRecords as unknown as Record<string, unknown>[],
          "Медицина",
        );
        Object.assign(allChanges, result.changes);
        allDescriptions.push(...result.descriptions);
      }

      if (achievements) {
        const result = compareItemArrays(
          oldPerson.achievements as unknown as Record<string, unknown>[],
          achievements as unknown as Record<string, unknown>[],
          "Нагороди",
        );
        Object.assign(allChanges, result.changes);
        allDescriptions.push(...result.descriptions);
      }

      if (equipment) {
        const result = compareItemArrays(
          oldPerson.equipment as unknown as Record<string, unknown>[],
          equipment as unknown as Record<string, unknown>[],
          "Спорядження",
        );
        Object.assign(allChanges, result.changes);
        allDescriptions.push(...result.descriptions);
      }

      if (positionHistory) {
        const result = compareItemArrays(
          oldPerson.positionHistory as unknown as Record<string, unknown>[],
          positionHistory as unknown as Record<string, unknown>[],
          "Історія посад",
        );
        Object.assign(allChanges, result.changes);
        allDescriptions.push(...result.descriptions);
      }

      if (clothingSizes && oldPerson.clothingSizes) {
        const result = compareFields(
          oldPerson.clothingSizes as unknown as Record<string, unknown>,
          clothingSizes as unknown as Record<string, unknown>,
          ["height", "chest", "waist", "shoes", "headgear", "uniform"],
        );
        Object.assign(allChanges, result);
        for (const [key, val] of Object.entries(result)) {
          allDescriptions.push(
            `змінив «${getLabel(key)}» з «${val.old ?? ""}» на «${val.new ?? ""}»`,
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
      await logUpdate("MilitaryPersonnel", id, description, allChanges);
    }

    revalidatePath("/military");
    revalidatePath(`/military/${id}`);
    return { id: person.id, fullName: person.fullName };
  } catch {
    throw new Error("Помилка при збереженні");
  }
}

export async function deleteMilitary(id: number) {
  await requireModerator();

  try {
    const person = await prisma.militaryPersonnel.delete({ where: { id } });

    await logDelete(
      "MilitaryPersonnel",
      id,
      `Видалив анкету військовослужбовця «${person.fullName}»`,
    );

    revalidatePath("/military");
    return { id: person.id, fullName: person.fullName };
  } catch {
    throw new Error("Помилка при видаленні");
  }
}
