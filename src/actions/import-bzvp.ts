"use server";

import * as XLSX from "xlsx";
import { prisma } from "@root/lib/prisma";
import { revalidatePath } from "next/cache";
import { logCreate, logUpdate } from "@root/lib/audit";
import { auth } from "@root/lib/auth";
import { redirect } from "next/navigation";

async function requireModerator() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "moderator")) {
    redirect("/");
  }
}

const COLUMN_ALIASES: Record<string, string> = {
  "піб": "fullName",
  "прізвище ім'я по батькові": "fullName",
  "прізвище ім'я по-батькові": "fullName",
  "звання": "rank",
  "військове звання": "rank",
  "дата народження": "birthDate",
  "день народження": "birthDate",
  "дата нар.": "birthDate",
  "місце народження": "birthPlace",
  "народ.": "birthPlace",
  "фото": "photo",
  "паспорт": "passport",
  "серія та номер паспорту": "passport",
  "паспорт видано": "passportIssued",
  "ким і коли виданий паспорт": "passportIssued",
  "іпн": "tin",
  "рнокпп": "tin",
  "військовий квиток": "militaryId",
  "№ військового квитка": "militaryId",
  "в/к видано": "militaryIdIssued",
  "ким і коли виданий в/к": "militaryIdIssued",
  "убд": "ubd",
  "дата убд": "ubdDate",
  "в/ч": "serviceUnit",
  "військова частина": "serviceUnit",
  "роки служби": "serviceYears",
  "цивільна робота": "civilianJob",
  "фах": "civilianJob",
  "освіта": "education",
  "фактична адреса": "actualAddress",
  "адреса проживання": "actualAddress",
  "прописка": "registrationAddress",
  "адреса реєстрації": "registrationAddress",
  "водійське": "driverLicense",
  "посвідчення водія": "driverLicense",
  "судимість": "criminalRecord",
  "поліція": "policeRecords",
  "адмін-порушення": "policeRecords",
  "склад сім'ї": "family",
  "родина": "family",
  "телефон": "phone",
  "номер телефону": "phone",
  "тел.": "phone",
  "телефони рідних": "relativePhones",
  "родичі телефон": "relativePhones",
  "особисте розпорядження": "personalOrder",
  "призваний": "conscription",
  "ртцк": "conscription",
  "стан здоров'я": "health",
  "здоров'я": "health",
  "скарги": "healthComplaints",
  "моральний стан": "moralState",
  "морально-психологічний": "moralState",
  "група крові": "bloodType",
  "кров": "bloodType",
  "розмір взуття": "shoeSize",
  "взуття": "shoeSize",
  "примітки": "notes",
  "нотатки": "notes",
  "статус": "status",
  "дата прибуття": "arrivalDate",
  "прибуття": "arrivalDate",
  "період навчання": "trainingPeriod",
  "навчання": "trainingPeriod",
  "спеціалізація": "specialization",
  "спеціальність": "specialization",
};

const REQUIRED_FIELDS = ["fullName", "rank", "birthDate", "status", "arrivalDate", "trainingPeriod"];

const FIELD_LABELS: Record<string, string> = {
  fullName: "ПІБ",
  rank: "Звання",
  birthDate: "Дата народження",
  birthPlace: "Місце народження",
  photo: "Фото",
  passport: "Паспорт",
  passportIssued: "Паспорт видано",
  tin: "ІПН",
  militaryId: "Військовий квиток",
  militaryIdIssued: "В/к видано",
  ubd: "УБД",
  ubdDate: "Дата УБД",
  serviceUnit: "В/ч",
  serviceYears: "Роки служби",
  civilianJob: "Цивільна робота",
  education: "Освіта",
  actualAddress: "Фактична адреса",
  registrationAddress: "Прописка",
  driverLicense: "Посвідчення водія",
  criminalRecord: "Судимість",
  policeRecords: "Поліція",
  family: "Склад сім'ї",
  phone: "Телефон",
  relativePhones: "Телефони рідних",
  personalOrder: "Особисте розпорядження",
  conscription: "Призваний",
  health: "Стан здоров'я",
  healthComplaints: "Скарги",
  moralState: "Моральний стан",
  bloodType: "Група крові",
  shoeSize: "Розмір взуття",
  notes: "Примітки",
  status: "Статус",
  arrivalDate: "Дата прибуття",
  trainingPeriod: "Період навчання",
  specialization: "Спеціалізація",
};

const ALL_FIELDS = Object.keys(FIELD_LABELS);

function normalizeHeader(header: string): string {
  const h = header.trim().toLowerCase().replace(/[«»"''\[\]]/g, "").replace(/\s+/g, " ");
  return h;
}

function mapRow(raw: Record<string, unknown>): Record<string, string> {
  const mapped: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    const normalized = normalizeHeader(key);
    const field = COLUMN_ALIASES[normalized];
    if (field) {
      const str = value == null ? "" : String(value).trim();
      if (str) mapped[field] = str;
    }
  }
  return mapped;
}

function validateRow(data: Record<string, string>): string[] {
  const errors: string[] = [];
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) {
      errors.push(`Не заповнено обов'язкове поле «${FIELD_LABELS[field]}»`);
    }
  }
  return errors;
}

export interface ParsedRow {
  index: number;
  data: Record<string, string>;
  errors: string[];
  duplicate: { id: number; fullName: string; birthDate: string } | null;
}

export interface ParseResult {
  rows: ParsedRow[];
  totalCount: number;
  validCount: number;
  errorCount: number;
  duplicateCount: number;
}

export async function parseExcelBzvp(formData: FormData): Promise<ParseResult> {
  await requireModerator();

  const file = formData.get("file") as File;
  if (!file) throw new Error("Файл не завантажено");

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Excel-файл порожній");

  const sheet = workbook.Sheets[sheetName];
  const rawData: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const rows: ParsedRow[] = [];
  let validCount = 0;
  let errorCount = 0;
  let duplicateCount = 0;

  for (let i = 0; i < rawData.length; i++) {
    const data = mapRow(rawData[i]);
    const errors = validateRow(data);

    let duplicate: { id: number; fullName: string; birthDate: string } | null = null;
    if (errors.length === 0 && data.fullName && data.birthDate) {
      const existing = await prisma.bzvpPersonnel.findFirst({
        where: { fullName: data.fullName, birthDate: data.birthDate },
        select: { id: true, fullName: true, birthDate: true },
      });
      if (existing) {
        duplicate = existing;
        duplicateCount++;
      }
    }

    if (errors.length === 0) {
      validCount++;
    } else {
      errorCount++;
    }

    rows.push({ index: i, data, errors, duplicate });
  }

  return { rows, totalCount: rows.length, validCount, errorCount, duplicateCount };
}

type Decision = "skip" | "update" | "add";

export async function importBzvp(
  rows: ParsedRow[],
  decisions: Record<number, Decision>,
) {
  await requireModerator();

  let imported = 0;
  let skipped = 0;
  let updated = 0;

  for (const row of rows) {
    if (row.errors.length > 0) {
      skipped++;
      continue;
    }

    const decision = decisions[row.index] ?? "add";

    if (decision === "skip") {
      skipped++;
      continue;
    }

    const prismaData = {
      fullName: row.data.fullName ?? "",
      rank: row.data.rank ?? "",
      birthDate: row.data.birthDate ?? "",
      birthPlace: row.data.birthPlace || null,
      photo: row.data.photo || null,
      passport: row.data.passport || null,
      passportIssued: row.data.passportIssued || null,
      tin: row.data.tin || null,
      militaryId: row.data.militaryId || null,
      militaryIdIssued: row.data.militaryIdIssued || null,
      ubd: row.data.ubd || null,
      ubdDate: row.data.ubdDate || null,
      serviceUnit: row.data.serviceUnit || null,
      serviceYears: row.data.serviceYears || null,
      civilianJob: row.data.civilianJob || null,
      education: row.data.education || null,
      actualAddress: row.data.actualAddress || null,
      registrationAddress: row.data.registrationAddress || null,
      driverLicense: row.data.driverLicense || null,
      criminalRecord: row.data.criminalRecord || null,
      policeRecords: row.data.policeRecords || null,
      family: row.data.family || null,
      phone: row.data.phone || null,
      relativePhones: row.data.relativePhones || null,
      personalOrder: row.data.personalOrder || null,
      conscription: row.data.conscription || null,
      health: row.data.health || null,
      healthComplaints: row.data.healthComplaints || null,
      moralState: row.data.moralState || null,
      bloodType: row.data.bloodType || null,
      shoeSize: row.data.shoeSize || null,
      notes: row.data.notes || null,
      status: row.data.status ?? "training",
      arrivalDate: row.data.arrivalDate ?? new Date().toISOString().split("T")[0],
      trainingPeriod: row.data.trainingPeriod ?? "",
      specialization: row.data.specialization || null,
    };

    if (decision === "update" && row.duplicate) {
      await prisma.bzvpPersonnel.update({
        where: { id: row.duplicate.id },
        data: prismaData,
      });
      await logUpdate(
        "BzvpPersonnel",
        row.duplicate.id,
        `Оновлено з імпорту: «${row.data.fullName}»`,
      );
      updated++;
    } else {
      const person = await prisma.bzvpPersonnel.create({ data: prismaData });
      await logCreate(
        "BzvpPersonnel",
        person.id,
        `Імпортовано: «${person.fullName}»`,
      );
      imported++;
    }
  }

  revalidatePath("/bzvp");
  return { imported, skipped, updated };
}
