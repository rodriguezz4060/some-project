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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function replaceRelation(delegate: any, personnelId: number, items: Record<string, unknown>[]) {
  await delegate.deleteMany({ where: { personnelId } });
  if (items.length > 0) {
    await delegate.createMany({ data: items });
  }
}

export async function createMilitary(rawData: CreateMilitaryData) {
  await requireModerator();
  const parsed = createMilitarySchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join("; "));
  }
  const data = parsed.data;
  const person = await prisma.militaryPersonnel.create({
    data: {
      fullName: data.fullName,
      rank: data.rank,
      position: data.position,
      unit: data.unit,
      status: data.status,
      birthDate: data.birthDate,
      photo: data.photo || null,
      experience: data.experience ?? null,
      missions: data.missions ?? null,
      phone: data.phone || null,
      email: data.email || null,
      lastActiveDays: data.lastActiveDays ?? null,
      medicalRecords: data.medicalRecords?.length
        ? { createMany: { data: data.medicalRecords.map((r) => ({ ...r, notes: r.notes || null })) } }
        : undefined,
      achievements: data.achievements?.length
        ? { createMany: { data: data.achievements.map((a) => ({ ...a, description: a.description || null })) } }
        : undefined,
      equipment: data.equipment?.length
        ? { createMany: { data: data.equipment.map((e) => ({ ...e, serialNumber: e.serialNumber || null })) } }
        : undefined,
      positionHistory: data.positionHistory?.length
        ? { createMany: { data: data.positionHistory.map((p) => ({ ...p, endDate: p.endDate || null })) } }
        : undefined,
      clothingSizes: data.clothingSizes
        ? { create: { ...data.clothingSizes } }
        : undefined,
    },
  });

  await logCreate(
    "MilitaryPersonnel",
    person.id,
    `Створив анкету військовослужбовця «${person.fullName}»`,
  );

  revalidatePath("/military");
  return { id: person.id, fullName: person.fullName };
}

export async function updateMilitary(id: number, rawData: CreateMilitaryData) {
  await requireModerator();
  const parsed = createMilitarySchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join("; "));
  }
  const data = parsed.data;
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

  const person = await prisma.militaryPersonnel.update({
    where: { id },
    data: {
      fullName: data.fullName,
      rank: data.rank,
      position: data.position,
      unit: data.unit,
      status: data.status,
      birthDate: data.birthDate,
      photo: data.photo || null,
      experience: data.experience ?? null,
      missions: data.missions ?? null,
      phone: data.phone || null,
      email: data.email || null,
      lastActiveDays: data.lastActiveDays ?? null,
    },
  });

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
  }

  if (data.medicalRecords) {
    await replaceRelation(
      prisma.medicalRecord,
      id,
      data.medicalRecords.map((r) => ({
        personnelId: id,
        condition: r.condition,
        diagnosisDate: r.diagnosisDate,
        status: r.status,
        notes: r.notes || null,
      })),
    );

    if (oldPerson) {
      const result = compareItemArrays(
        oldPerson.medicalRecords as unknown as Record<string, unknown>[],
        data.medicalRecords as unknown as Record<string, unknown>[],
        "Медицина",
      );
      Object.assign(allChanges, result.changes);
      allDescriptions.push(...result.descriptions);
    }
  }

  if (data.achievements) {
    await replaceRelation(
      prisma.achievement,
      id,
      data.achievements.map((a) => ({
        personnelId: id,
        name: a.name,
        date: a.date,
        type: a.type,
        description: a.description || null,
      })),
    );

    if (oldPerson) {
      const result = compareItemArrays(
        oldPerson.achievements as unknown as Record<string, unknown>[],
        data.achievements as unknown as Record<string, unknown>[],
        "Нагороди",
      );
      Object.assign(allChanges, result.changes);
      allDescriptions.push(...result.descriptions);
    }
  }

  if (data.equipment) {
    await replaceRelation(
      prisma.equipment,
      id,
      data.equipment.map((e) => ({
        personnelId: id,
        name: e.name,
        type: e.type,
        serialNumber: e.serialNumber || null,
        issuedDate: e.issuedDate,
      })),
    );

    if (oldPerson) {
      const result = compareItemArrays(
        oldPerson.equipment as unknown as Record<string, unknown>[],
        data.equipment as unknown as Record<string, unknown>[],
        "Спорядження",
      );
      Object.assign(allChanges, result.changes);
      allDescriptions.push(...result.descriptions);
    }
  }

  if (data.positionHistory) {
    await replaceRelation(
      prisma.positionEntry,
      id,
      data.positionHistory.map((p) => ({
        personnelId: id,
        position: p.position,
        unit: p.unit,
        startDate: p.startDate,
        endDate: p.endDate || null,
      })),
    );

    if (oldPerson) {
      const result = compareItemArrays(
        oldPerson.positionHistory as unknown as Record<string, unknown>[],
        data.positionHistory as unknown as Record<string, unknown>[],
        "Історія посад",
      );
      Object.assign(allChanges, result.changes);
      allDescriptions.push(...result.descriptions);
    }
  }

  if (data.clothingSizes) {
    await prisma.clothingSizes.upsert({
      where: { personnelId: id },
      update: { ...data.clothingSizes },
      create: { personnelId: id, ...data.clothingSizes },
    });

    if (oldPerson?.clothingSizes) {
      const result = compareFields(
        oldPerson.clothingSizes as unknown as Record<string, unknown>,
        data.clothingSizes as unknown as Record<string, unknown>,
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
}

export async function deleteMilitary(id: number) {
  await requireModerator();
  const person = await prisma.militaryPersonnel.delete({ where: { id } });

  await logDelete(
    "MilitaryPersonnel",
    id,
    `Видалив анкету військовослужбовця «${person.fullName}»`,
  );

  revalidatePath("/military");
  return { id: person.id, fullName: person.fullName };
}
