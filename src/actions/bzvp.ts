"use server";

import { prisma } from "@root/lib/prisma";
import { revalidatePath } from "next/cache";
import { logCreate, logUpdate, logDelete } from "@root/lib/audit";
import { requireModerator } from "@root/lib/auth-guards";
import { compareFields } from "@root/lib/diff";
import { bzvpSchema, type BzvpData } from "@root/lib/schemas/bzvp";

export const fieldLabels: Record<string, string> = {
  fullName: "ПІБ",
  rank: "Звання",
  birthDate: "Дата народження",
  birthPlace: "Місце народження",
  photo: "Фото",
  passport: "Паспорт",
  passportIssued: "Паспорт видано",
  tin: "РНОКПП",
  militaryId: "Військовий квиток",
  militaryIdIssued: "Військовий квиток видано",
  ubd: "УБД",
  ubdDate: "Дата УБД",
  serviceUnit: "Частина",
  serviceYears: "Роки служби",
  civilianJob: "Цивільна спеціальність",
  education: "Освіта",
  actualAddress: "Фактична адреса",
  registrationAddress: "Адреса реєстрації",
  driverLicense: "Посвідчення водія",
  criminalRecord: "Судимість",
  policeRecords: "Облік в поліції",
  family: "Склад сім'ї",
  phone: "Телефон",
  relativePhones: "Телефони рідних",
  personalOrder: "Особиста справа №",
  conscription: "Військкомат",
  health: "Стан здоров'я",
  healthComplaints: "Скарги на здоров'я",
  moralState: "Моральний стан",
  bloodType: "Група крові",
  shoeSize: "Розмір взуття",
  notes: "Примітки",
  status: "Статус",
  arrivalDate: "Дата прибуття",
  trainingPeriod: "Період навчання",
  specialization: "Спеціалізація",
};

const allFields = Object.keys(bzvpSchema.shape);

function parseBzvp(rawData: BzvpData) {
  const parsed = bzvpSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(Object.values(parsed.error.flatten().fieldErrors).flat().join("; "));
  }
  return parsed.data;
}

export async function createBzvp(rawData: BzvpData) {
  await requireModerator();
  const data = parseBzvp(rawData);
  const today = new Date().toISOString().split("T")[0];
  const { status, arrivalDate, trainingPeriod, ...rest } = data;

  try {
    const person = await prisma.bzvpPersonnel.create({
      data: {
        ...rest,
        status: status ?? "training",
        arrivalDate: arrivalDate ?? today,
        trainingPeriod: trainingPeriod ?? "",
      },
    });

    await logCreate(
      "BzvpPersonnel",
      person.id,
      `Створив анкету БЗВП «${person.fullName}»`,
    );

    revalidatePath("/bzvp");
    return { id: person.id, fullName: person.fullName };
  } catch {
    throw new Error("Помилка при збереженні");
  }
}

export async function updateBzvp(id: number, rawData: BzvpData) {
  await requireModerator();
  const data = parseBzvp(rawData);
  const { status, arrivalDate, trainingPeriod, ...rest } = data;

  try {
    const oldPerson = await prisma.bzvpPersonnel.findUnique({ where: { id } });

    const person = await prisma.bzvpPersonnel.update({
      where: { id },
      data: {
        ...rest,
        status: status ?? "training",
        arrivalDate: arrivalDate ?? oldPerson?.arrivalDate ?? "",
        trainingPeriod: trainingPeriod ?? "",
      },
    });

    if (oldPerson) {
      const changes = compareFields(
        oldPerson,
        data,
        allFields,
        fieldLabels,
      );

      if (Object.keys(changes).length > 0) {
        const descriptions: string[] = [];
        for (const [key, val] of Object.entries(changes)) {
          descriptions.push(
            `змінив «${getLabel(key)}» з «${val.old ?? ""}» на «${val.new ?? ""}»`,
          );
        }

        let description: string;
        if (descriptions.length <= 3) {
          description = `Зміни в картці БЗВП «${person.fullName}»: ${descriptions.join("; ")}`;
        } else {
          description = `Зміни в картці БЗВП «${person.fullName}»: ${descriptions.slice(0, 3).join("; ")} та ще ${descriptions.length - 3} змін`;
        }

        await logUpdate("BzvpPersonnel", id, description, changes);
      }
    }

    revalidatePath("/bzvp");
    return { id: person.id, fullName: person.fullName };
  } catch {
    throw new Error("Помилка при збереженні");
  }
}

export async function deleteBzvp(id: number) {
  await requireModerator();

  try {
    const person = await prisma.bzvpPersonnel.delete({ where: { id } });

    await logDelete(
      "BzvpPersonnel",
      id,
      `Видалив анкету БЗВП «${person.fullName}»`,
    );

    revalidatePath("/bzvp");
    return { id: person.id, fullName: person.fullName };
  } catch {
    throw new Error("Помилка при видаленні");
  }
}
