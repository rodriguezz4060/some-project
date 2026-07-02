"use server";

import * as XLSX from "xlsx";
import { prisma } from "@root/lib/prisma";
import { revalidatePath } from "next/cache";
import { logCreate, logUpdate } from "@root/lib/audit";
import { requireModerator } from "@root/lib/auth-guards";
import { BzvpRowSchema } from "@root/lib/schemas/import-bzvp";
import { FIELD_LABELS, type BzvpFieldKey } from "@/components/shared/bzvp/fields";
import { today } from "@root/lib/utils/dates";
import { COLUMN_ALIASES, STATUS_ALIASES } from "./constants";
import type { Prisma } from "@/generated/prisma/client";

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

function buildPrismaData(data: Record<string, string>): Prisma.BzvpPersonnelCreateManyInput {
  return {
    fullName: data.fullName ?? "",
    rank: data.rank ?? "",
    birthDate: data.birthDate ?? "",
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
    status: data.status ?? "training",
    arrivalDate: data.arrivalDate ?? today(),
    trainingPeriod: data.trainingPeriod ?? "",
    specialization: data.specialization || null,
  };
}

const DUPLICATE_BATCH = 500;

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

  const validated = rawData.map((raw, index) => {
    const mapped = mapRow(raw);
    const { success, data, errors } = validateRow(mapped);
    return { index, data, errors, success };
  });

  const validRows = validated.filter((r) => r.success);

  const duplicateMap = new Map<string, { id: number; fullName: string; birthDate: string }>();

  for (let i = 0; i < validRows.length; i += DUPLICATE_BATCH) {
    const batch = validRows.slice(i, i + DUPLICATE_BATCH);
    const existing = await prisma.bzvpPersonnel.findMany({
      where: {
        OR: batch.map((r) => ({
          fullName: r.data.fullName,
          birthDate: r.data.birthDate,
        })),
      },
      select: { id: true, fullName: true, birthDate: true },
    });
    for (const e of existing) {
      duplicateMap.set(`${e.fullName}|${e.birthDate}`, e);
    }
  }

  let validCount = 0;
  let errorCount = 0;
  let duplicateCount = 0;

  const rows: ParsedRow[] = validated.map(({ index, data, errors, success }) => {
    if (!success) {
      errorCount++;
      return { index, data, errors, duplicate: null };
    }
    validCount++;

    let duplicate: ParsedRow["duplicate"] = null;
    if (data.fullName && data.birthDate) {
      const key = `${data.fullName}|${data.birthDate}`;
      duplicate = duplicateMap.get(key) ?? null;
      if (duplicate) duplicateCount++;
    }

    return { index, data, errors, duplicate };
  });

  return { rows, totalCount: rows.length, validCount, errorCount, duplicateCount };
}

type Decision = "skip" | "update" | "add";

const CREATE_BATCH = 100;

export async function importBzvp(
  rows: ParsedRow[],
  decisions: Record<number, Decision>,
) {
  const session = await requireModerator();
  const userId = Number(session.user.id);

  let imported = 0;
  let skipped = 0;
  let updated = 0;

  const toCreate: Prisma.BzvpPersonnelCreateManyInput[] = [];

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

    const prismaData = buildPrismaData(row.data);

    if (decision === "update" && row.duplicate) {
      await prisma.bzvpPersonnel.update({
        where: { id: row.duplicate.id },
        data: prismaData,
      });
      logUpdate(
        "BzvpPersonnel",
        row.duplicate.id,
        `Оновлено з імпорту: «${row.data.fullName}»`,
        undefined,
        userId,
      );
      updated++;
    } else {
      toCreate.push(prismaData);
    }
  }

  for (let i = 0; i < toCreate.length; i += CREATE_BATCH) {
    const batch = toCreate.slice(i, i + CREATE_BATCH);
    const result = await prisma.bzvpPersonnel.createMany({ data: batch });
    imported += result.count;
  }

  if (imported > 0) {
    logCreate("BzvpPersonnel", 0, `Імпортовано ${imported} анкет БЗВП`, userId);
  }

  revalidatePath("/bzvp");
  return { imported, skipped, updated };
}
