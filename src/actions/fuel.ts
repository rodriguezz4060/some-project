"use server";

import { prisma } from "@root/lib/prisma";
import { revalidatePath } from "next/cache";
import { logCreate, logUpdate, logDelete } from "@root/lib/audit";
import { requireModerator } from "@root/lib/auth-guards";
import { compareFields } from "@root/lib/diff";
import { PURPOSE_LABELS, VEHICLE_TYPE_LABELS, VEHICLE_STATUS_LABELS } from "@/components/shared/fuel/constants";
import { createVehicleSchema, createFuelRecordSchema } from "@root/lib/schemas/fuel";
import type { CreateVehicleData, CreateFuelRecordData } from "@root/lib/schemas/fuel";

const fieldLabels: Record<string, string> = {
  brand: "Марка",
  model: "Модель",
  licensePlate: "Держномер",
  type: "Тип",
  year: "Рік випуску",
  vin: "VIN-код",
  fuelType: "Тип пального",
  tankCapacity: "Об'єм баку",
  unit: "Підрозділ",
  notes: "Примітки",
  date: "Дата",
  liters: "Літри",
  pricePerLiter: "Ціна за літр",
  totalCost: "Загальна вартість",
  mileage: "Пробіг",
  driverName: "Водій",
  invoiceNumber: "Номер накладної",
  supplier: "Постачальник",
  purpose: "Призначення",
};

function parseVehicle(rawData: CreateVehicleData) {
  const parsed = createVehicleSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join("; "));
  }
  return parsed.data;
}

function parseFuelRecord(rawData: CreateFuelRecordData) {
  const parsed = createFuelRecordSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join("; "));
  }
  return parsed.data;
}

// ── Vehicles ──

export async function createVehicle(rawData: CreateVehicleData) {
  const session = await requireModerator();
  const userId = Number(session.user.id);
  const data = parseVehicle(rawData);

  try {
    const vehicle = await prisma.vehicle.create({ data });

    const typeLabel = VEHICLE_TYPE_LABELS[vehicle.type as keyof typeof VEHICLE_TYPE_LABELS] ?? vehicle.type;
    await logCreate("Vehicle", vehicle.id, `Додав авто «${vehicle.brand} ${vehicle.model}» (${vehicle.licensePlate}), тип: ${typeLabel}, підрозділ: ${vehicle.unit}`, userId);

    revalidatePath("/fuel");
    return { id: vehicle.id, brand: vehicle.brand, model: vehicle.model, licensePlate: vehicle.licensePlate };
  } catch {
    throw new Error("Помилка при збереженні");
  }
}

export async function updateVehicle(id: number, rawData: CreateVehicleData) {
  const session = await requireModerator();
  const userId = Number(session.user.id);
  const data = parseVehicle(rawData);

  try {
    const oldVehicle = await prisma.vehicle.findUnique({ where: { id } });

    const vehicle = await prisma.vehicle.update({ where: { id }, data });

    if (oldVehicle) {
      const changes = compareFields(
        oldVehicle as Record<string, unknown>,
        data as Record<string, unknown>,
        ["brand", "model", "licensePlate", "type", "year", "vin", "fuelType", "tankCapacity", "unit", "notes"],
        fieldLabels,
      );

      const descriptions = Object.entries(changes).map(
        ([key, val]) => `змінив «${key}» з «${val.old ?? ""}» на «${val.new ?? ""}»`,
      );

      let description: string;
      if (descriptions.length === 0) {
        description = `Оновив дані авто «${vehicle.brand} ${vehicle.model}» (без змін)`;
      } else if (descriptions.length <= 3) {
        description = `Оновлено авто «${vehicle.brand} ${vehicle.model}»: ${descriptions.join("; ")}`;
      } else {
        description = `Оновлено авто «${vehicle.brand} ${vehicle.model}»: ${descriptions.slice(0, 3).join("; ")} та ще ${descriptions.length - 3} змін`;
      }

      await logUpdate("Vehicle", id, description, changes, userId);
    }

    revalidatePath("/fuel");
    revalidatePath(`/fuel/vehicles/${id}`);
    return { id: vehicle.id, brand: vehicle.brand, model: vehicle.model, licensePlate: vehicle.licensePlate };
  } catch {
    throw new Error("Помилка при збереженні");
  }
}

export async function setVehicleStatus(id: number, status: string) {
  const session = await requireModerator();
  const userId = Number(session.user.id);

  try {
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { status },
      select: { id: true, brand: true, model: true },
    });

    const statusLabel = VEHICLE_STATUS_LABELS[status as keyof typeof VEHICLE_STATUS_LABELS] ?? status;
    await logUpdate("Vehicle", id, `Змінив статус авто «${vehicle.brand} ${vehicle.model}» на «${statusLabel}»`, undefined, userId);

    revalidatePath("/fuel");
    revalidatePath(`/fuel/vehicles/${id}`);
    return { id: vehicle.id, status };
  } catch {
    throw new Error("Помилка при зміні статусу");
  }
}

// ── Fuel Records ──

export async function createFuelRecord(rawData: CreateFuelRecordData) {
  const session = await requireModerator();
  const userId = Number(session.user.id);
  const data = parseFuelRecord(rawData);

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
      select: { brand: true, model: true, licensePlate: true, status: true },
    });

    if (vehicle && vehicle.status !== "active") {
      throw new Error("Авто неактивне — заправка неможлива");
    }

    const record = await prisma.fuelRecord.create({
      data: { ...data, createdById: userId },
    });

    const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : `#${data.vehicleId}`;
    await logCreate("FuelRecord", record.id, `Заправка: ${data.liters.toFixed(1)} л на ${vehicleName}, водій «${data.driverName}»`, userId);

    revalidatePath("/fuel");
    revalidatePath(`/fuel/vehicles/${data.vehicleId}`);
    revalidatePath("/fuel/records");
    return { id: record.id };
  } catch {
    throw new Error("Помилка при збереженні");
  }
}

export async function updateFuelRecord(id: number, rawData: CreateFuelRecordData) {
  const session = await requireModerator();
  const userId = Number(session.user.id);
  const data = parseFuelRecord(rawData);

  try {
    const oldRecord = await prisma.fuelRecord.findUnique({
      where: { id },
      include: { vehicle: { select: { brand: true, model: true, licensePlate: true } } },
    });

    const record = await prisma.fuelRecord.update({ where: { id }, data });

    if (oldRecord) {
      const changes = compareFields(
        oldRecord as Record<string, unknown>,
        data as Record<string, unknown>,
        ["date", "fuelType", "liters", "pricePerLiter", "totalCost", "mileage", "driverName", "invoiceNumber", "supplier", "purpose"],
        fieldLabels,
        { purpose: PURPOSE_LABELS },
      );

      const descriptions = Object.entries(changes).map(
        ([key, val]) => `змінив «${key}» з «${val.old ?? ""}» на «${val.new ?? ""}»`,
      );

      const vehicle = oldRecord.vehicle;
      const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : `#${data.vehicleId}`;

      let description: string;
      if (descriptions.length === 0) {
        description = `Оновив заправку №${id} для ${vehicleName} (без змін)`;
      } else if (descriptions.length <= 3) {
        description = `Оновлено заправку №${id} (${vehicleName}): ${descriptions.join("; ")}`;
      } else {
        description = `Оновлено заправку №${id} (${vehicleName}): ${descriptions.slice(0, 3).join("; ")} та ще ${descriptions.length - 3} змін`;
      }

      await logUpdate("FuelRecord", id, description, changes, userId);
    }

    revalidatePath("/fuel");
    revalidatePath(`/fuel/vehicles/${data.vehicleId}`);
    revalidatePath("/fuel/records");
    return { id: record.id };
  } catch {
    throw new Error("Помилка при збереженні");
  }
}

export async function deleteFuelRecord(id: number) {
  const session = await requireModerator();
  const userId = Number(session.user.id);

  try {
    const record = await prisma.fuelRecord.delete({
      where: { id },
      include: { vehicle: { select: { brand: true, model: true, licensePlate: true } } },
    });

    const vehicleName = `${record.vehicle.brand} ${record.vehicle.model} (${record.vehicle.licensePlate})`;
    await logDelete("FuelRecord", id, `Видалив заправку: ${record.liters.toFixed(1)} л на ${vehicleName}, водій «${record.driverName}»`, userId);

    revalidatePath("/fuel");
    revalidatePath(`/fuel/vehicles/${record.vehicleId}`);
    revalidatePath("/fuel/records");
    return { id: record.id };
  } catch {
    throw new Error("Помилка при видаленні");
  }
}
