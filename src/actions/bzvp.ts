"use server";

import { prisma } from "@root/lib/prisma";
import { revalidatePath } from "next/cache";
import { logCreate, logUpdate, logDelete } from "@root/lib/audit";

interface CreateBzvpData {
  rank: string;
  fullName: string;
  birthDate: string;
  birthPlace: string;
  photo: string;
  passport: string;
  passportIssued: string;
  tin: string;
  militaryId: string;
  militaryIdIssued: string;
  ubd: string;
  ubdDate: string;
  serviceUnit: string;
  serviceYears: string;
  civilianJob: string;
  education: string;
  actualAddress: string;
  registrationAddress: string;
  driverLicense: string;
  criminalRecord: string;
  policeRecords: string;
  family: string;
  phone: string;
  relativePhones: string;
  personalOrder: string;
  conscription: string;
  health: string;
  healthComplaints: string;
  moralState: string;
  bloodType: string;
  shoeSize: string;
  notes: string;
}

interface UpdateBzvpData extends CreateBzvpData {
  status: string;
  arrivalDate: string;
  trainingPeriod: string;
  specialization: string;
}

type Changes = Record<string, { old: string | null; new: string | null }>;

const fieldLabels: Record<string, string> = {
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

const mainFields: (keyof CreateBzvpData | keyof UpdateBzvpData)[] = [
  "fullName", "rank", "birthDate", "birthPlace", "photo",
  "passport", "passportIssued", "tin", "militaryId", "militaryIdIssued",
  "ubd", "ubdDate", "serviceUnit", "serviceYears", "civilianJob",
  "education", "actualAddress", "registrationAddress", "driverLicense",
  "criminalRecord", "policeRecords", "family", "phone", "relativePhones",
  "personalOrder", "conscription", "health", "healthComplaints",
  "moralState", "bloodType", "shoeSize", "notes",
];

const updateFields = [...mainFields, "status", "arrivalDate", "trainingPeriod", "specialization"];

export async function createBzvp(data: CreateBzvpData) {
  const today = new Date().toISOString().split("T")[0];

  const person = await prisma.bzvpPersonnel.create({
    data: {
      fullName: data.fullName,
      rank: data.rank,
      birthDate: data.birthDate,
      birthPlace: data.birthPlace || null,
      photo: data.photo || null,
      passport: data.passport || null,
      passportIssued: data.passportIssued || null,
      tin: data.tin || null,
      militaryId: data.militaryId || null,
      militaryIdIssued: data.militaryIdIssued || null,
      ubd: data.ubd || null,
      ubdDate: data.ubdDate || null,
      serviceUnit: data.serviceUnit || null,
      serviceYears: data.serviceYears || null,
      civilianJob: data.civilianJob || null,
      education: data.education || null,
      actualAddress: data.actualAddress || null,
      registrationAddress: data.registrationAddress || null,
      driverLicense: data.driverLicense || null,
      criminalRecord: data.criminalRecord || null,
      policeRecords: data.policeRecords || null,
      family: data.family || null,
      phone: data.phone || null,
      relativePhones: data.relativePhones || null,
      personalOrder: data.personalOrder || null,
      conscription: data.conscription || null,
      health: data.health || null,
      healthComplaints: data.healthComplaints || null,
      moralState: data.moralState || null,
      bloodType: data.bloodType || null,
      shoeSize: data.shoeSize || null,
      notes: data.notes || null,
      status: "training",
      arrivalDate: today,
      trainingPeriod: "",
      specialization: null,
    },
  });

  await logCreate(
    "BzvpPersonnel",
    person.id,
    `Створив анкету БЗВП «${person.fullName}»`,
  );

  revalidatePath("/bzvp");
  return { id: person.id, fullName: person.fullName };
}

export async function updateBzvp(id: number, data: UpdateBzvpData) {
  const oldPerson = await prisma.bzvpPersonnel.findUnique({ where: { id } });

  const person = await prisma.bzvpPersonnel.update({
    where: { id },
    data: {
      fullName: data.fullName,
      rank: data.rank,
      birthDate: data.birthDate,
      birthPlace: data.birthPlace || null,
      photo: data.photo || null,
      passport: data.passport || null,
      passportIssued: data.passportIssued || null,
      tin: data.tin || null,
      militaryId: data.militaryId || null,
      militaryIdIssued: data.militaryIdIssued || null,
      ubd: data.ubd || null,
      ubdDate: data.ubdDate || null,
      serviceUnit: data.serviceUnit || null,
      serviceYears: data.serviceYears || null,
      civilianJob: data.civilianJob || null,
      education: data.education || null,
      actualAddress: data.actualAddress || null,
      registrationAddress: data.registrationAddress || null,
      driverLicense: data.driverLicense || null,
      criminalRecord: data.criminalRecord || null,
      policeRecords: data.policeRecords || null,
      family: data.family || null,
      phone: data.phone || null,
      relativePhones: data.relativePhones || null,
      personalOrder: data.personalOrder || null,
      conscription: data.conscription || null,
      health: data.health || null,
      healthComplaints: data.healthComplaints || null,
      moralState: data.moralState || null,
      bloodType: data.bloodType || null,
      shoeSize: data.shoeSize || null,
      notes: data.notes || null,
      status: data.status,
      arrivalDate: data.arrivalDate,
      trainingPeriod: data.trainingPeriod,
      specialization: data.specialization || null,
    },
  });

  if (oldPerson) {
    const changes = compareFields(
      oldPerson as unknown as Record<string, unknown>,
      data as unknown as Record<string, unknown>,
      updateFields as string[],
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
}

export async function deleteBzvp(id: number) {
  const person = await prisma.bzvpPersonnel.delete({ where: { id } });

  await logDelete(
    "BzvpPersonnel",
    id,
    `Видалив анкету БЗВП «${person.fullName}»`,
  );

  revalidatePath("/bzvp");
  return { id: person.id, fullName: person.fullName };
}
