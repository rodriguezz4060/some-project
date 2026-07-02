"use server";

import { prisma } from "@root/lib/prisma";
import { revalidatePath } from "next/cache";
import { logCreate, logUpdate, logDelete } from "@root/lib/audit";
import { requireModerator } from "@root/lib/auth-guards";
import { compareFields } from "@root/lib/diff";
import { fieldLabels } from "@root/lib/action-labels";
import { buildChangeLines, formatDescription } from "@root/lib/audit-helpers";
import { today } from "@root/lib/utils/dates";
import { getBzvpPage as getBzvpPageData } from "@root/lib/data/bzvp";
import { bzvpSchema, type BzvpData } from "@root/lib/schemas/bzvp";
import type { BzvpStatus, BzvpPersonnel } from "@/components/shared/bzvp/types";

const allFields = Object.keys(bzvpSchema.shape);

function parseBzvp(rawData: BzvpData) {
  const parsed = bzvpSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(Object.values(parsed.error.flatten().fieldErrors).flat().join("; "));
  }
  return parsed.data;
}

export async function createBzvp(rawData: BzvpData) {
  const session = await requireModerator();
  const userId = Number(session.user.id);
  const data = parseBzvp(rawData);
  const todayDate = today();
  const { status, arrivalDate, trainingPeriod, ...rest } = data;

  try {
    const person = await prisma.bzvpPersonnel.create({
      data: {
        ...rest,
        status: status ?? "training",
        arrivalDate: arrivalDate ?? todayDate,
        trainingPeriod: trainingPeriod ?? "",
      },
    });

    logCreate(
      "BzvpPersonnel",
      person.id,
      `Створив анкету БЗВП «${person.fullName}»`,
      userId,
    );

    revalidatePath("/bzvp");
    return { id: person.id, fullName: person.fullName };
  } catch {
    throw new Error("Помилка при збереженні");
  }
}

export async function updateBzvp(id: number, rawData: BzvpData) {
  const session = await requireModerator();
  const userId = Number(session.user.id);
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
        oldPerson as Record<string, unknown>,
        data as Record<string, unknown>,
        allFields,
        fieldLabels,
      );

      if (Object.keys(changes).length > 0) {
        const descriptions = buildChangeLines(changes);
        const description = formatDescription(
          descriptions,
          "Зміни в картці БЗВП",
          person.fullName,
        );
        logUpdate("BzvpPersonnel", id, description, changes, userId);
      }
    }

    revalidatePath("/bzvp");
    return { id: person.id, fullName: person.fullName };
  } catch {
    throw new Error("Помилка при збереженні");
  }
}

export async function deleteBzvp(id: number) {
  const session = await requireModerator();
  const userId = Number(session.user.id);

  try {
    const person = await prisma.bzvpPersonnel.delete({ where: { id } });

    logDelete(
      "BzvpPersonnel",
      id,
      `Видалив анкету БЗВП «${person.fullName}»`,
      userId,
    );

    revalidatePath("/bzvp");
    return { id: person.id, fullName: person.fullName };
  } catch {
    throw new Error("Помилка при видаленні");
  }
}

export async function getBzvpPage(
  statuses: BzvpStatus[],
  query: string,
  arrivalFrom: string,
  arrivalTo: string,
  page: number,
): Promise<BzvpPersonnel[]> {
  return getBzvpPageData(statuses, query, arrivalFrom, arrivalTo, page);
}
