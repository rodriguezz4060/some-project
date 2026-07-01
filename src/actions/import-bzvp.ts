"use server";

import * as XLSX from "xlsx";
import { prisma } from "@root/lib/prisma";
import { revalidatePath } from "next/cache";
import { logCreate, logUpdate } from "@root/lib/audit";
import { z } from "zod";
import { requireModerator } from "@root/lib/auth-guards";
import { FIELD_LABELS, type BzvpFieldKey } from "@/components/shared/bzvp/fields";

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

const UKR_DATE_REGEX = /^\d{2}[./-]\d{2}[./-]\d{4}$/;

const BZVP_STATUS_VALUES = ["training", "graduated", "transferred", "failed"] as const;

const STATUS_ALIASES: Record<string, string> = {
  "навчання": "training",
  "навчається": "training",
  "training": "training",
  "випущено": "graduated",
  "graduate": "graduated",
  "graduated": "graduated",
  "переведено": "transferred",
  "transferred": "transferred",
  "не склав": "failed",
  "failed": "failed",
};

const BzvpRowSchema = z.object({
  fullName: z.string().min(1),
  rank: z.string().min(1),
  birthDate: z.string().regex(UKR_DATE_REGEX),
  birthPlace: z.string().optional(),
  photo: z.string().optional(),
  passport: z.string().optional(),
  passportIssued: z.string().optional(),
  tin: z.string().optional(),
  militaryId: z.string().optional(),
  militaryIdIssued: z.string().optional(),
  ubd: z.string().optional(),
  ubdDate: z.string().regex(UKR_DATE_REGEX).optional(),
  serviceUnit: z.string().optional(),
  serviceYears: z.string().optional(),
  civilianJob: z.string().optional(),
  education: z.string().optional(),
  actualAddress: z.string().optional(),
  registrationAddress: z.string().optional(),
  driverLicense: z.string().optional(),
  criminalRecord: z.string().optional(),
  policeRecords: z.string().optional(),
  family: z.string().optional(),
  phone: z.string().optional(),
  relativePhones: z.string().optional(),
  personalOrder: z.string().optional(),
  conscription: z.string().optional(),
  health: z.string().optional(),
  healthComplaints: z.string().optional(),
  moralState: z.string().optional(),
  bloodType: z.string().optional(),
  shoeSize: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(BZVP_STATUS_VALUES),
  arrivalDate: z.string().regex(UKR_DATE_REGEX),
  trainingPeriod: z.string().min(1),
  specialization: z.string().optional(),
});


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

function validateRow(data: Record<string, string>): { success: boolean; data: Record<string, string>; errors: string[] } {
  const normalized = { ...data };
  if (normalized.status) {
    normalized.status = STATUS_ALIASES[normalized.status.trim().toLowerCase()] ?? normalized.status;
  }
  const result = BzvpRowSchema.safeParse(normalized);
  if (result.success) {
    return { success: true, data: result.data as Record<string, string>, errors: [] };
  }
  const errors = result.error.issues.map((issue) => {
    const field = issue.path.join(".");
    const label = FIELD_LABELS[field as BzvpFieldKey] ?? field;
    return `Поле «${label}»: ${issue.message}`;
  });
  return { success: false, data, errors };
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
    const mapped = mapRow(rawData[i]);
    const { success, data, errors } = validateRow(mapped);

    let duplicate: { id: number; fullName: string; birthDate: string } | null = null;
    if (success && data.fullName && data.birthDate) {
      const existing = await prisma.bzvpPersonnel.findFirst({
        where: { fullName: data.fullName, birthDate: data.birthDate },
        select: { id: true, fullName: true, birthDate: true },
      });
      if (existing) {
        duplicate = existing;
        duplicateCount++;
      }
    }

    if (success) {
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
