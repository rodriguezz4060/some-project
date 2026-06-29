"use server";

import { prisma } from "@root/lib/prisma";
import { revalidatePath } from "next/cache";
import { logCreate, logUpdate, logDelete } from "@root/lib/audit";
import { auth } from "@root/lib/auth";
import { redirect } from "next/navigation";

async function requireModerator() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "moderator")) {
    redirect("/");
  }
}

interface CreateVehicleData {
  brand: string;
  model: string;
  licensePlate: string;
  type: string;
  year?: number;
  vin?: string;
  fuelType: string;
  tankCapacity?: number;
  unit: string;
  notes?: string;
}

interface CreateFuelRecordData {
  vehicleId: number;
  date: string;
  fuelType: string;
  liters: number;
  pricePerLiter?: number;
  totalCost?: number;
  mileage?: number;
  driverName: string;
  invoiceNumber?: string;
  supplier?: string;
  purpose?: string;
}

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

function getLabel(key: string): string {
  return fieldLabels[key] ?? key;
}

type Changes = Record<string, { old: string | null; new: string | null }>;

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

// ── Vehicles ──

export async function createVehicle(data: CreateVehicleData) {
  await requireModerator();

  const vehicle = await prisma.vehicle.create({
    data: {
      brand: data.brand,
      model: data.model,
      licensePlate: data.licensePlate,
      type: data.type,
      year: data.year ?? null,
      vin: data.vin || null,
      fuelType: data.fuelType,
      tankCapacity: data.tankCapacity ?? null,
      unit: data.unit,
      notes: data.notes || null,
    },
  });

  await logCreate("Vehicle", vehicle.id, `Додав авто «${vehicle.brand} ${vehicle.model}» (${vehicle.licensePlate}), тип: ${getLabel(vehicle.type)}, підрозділ: ${vehicle.unit}`);

  revalidatePath("/fuel");
  return { id: vehicle.id, brand: vehicle.brand, model: vehicle.model, licensePlate: vehicle.licensePlate };
}

export async function updateVehicle(id: number, data: CreateVehicleData) {
  await requireModerator();

  const oldVehicle = await prisma.vehicle.findUnique({ where: { id } });

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      brand: data.brand,
      model: data.model,
      licensePlate: data.licensePlate,
      type: data.type,
      year: data.year ?? null,
      vin: data.vin || null,
      fuelType: data.fuelType,
      tankCapacity: data.tankCapacity ?? null,
      unit: data.unit,
      notes: data.notes || null,
    },
  });

  if (oldVehicle) {
    const changes = compareFields(
      oldVehicle as unknown as Record<string, unknown>,
      data as unknown as Record<string, unknown>,
      ["brand", "model", "licensePlate", "type", "year", "vin", "fuelType", "tankCapacity", "unit", "notes"],
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

    await logUpdate("Vehicle", id, description, changes);
  }

  revalidatePath("/fuel");
  revalidatePath(`/fuel/vehicles/${id}`);
  return { id: vehicle.id, brand: vehicle.brand, model: vehicle.model, licensePlate: vehicle.licensePlate };
}

export async function deleteVehicle(id: number) {
  await requireModerator();

  const vehicle = await prisma.vehicle.delete({ where: { id } });

  await logDelete("Vehicle", id, `Видалив авто «${vehicle.brand} ${vehicle.model}» (${vehicle.licensePlate}), підрозділ: ${vehicle.unit}`);

  revalidatePath("/fuel");
  return { id: vehicle.id };
}

// ── Fuel Records ──

export async function createFuelRecord(data: CreateFuelRecordData) {
  await requireModerator();

  const session = await auth();
  let userId = Number(session?.user?.id);
  if (!userId || !(await prisma.user.findUnique({ where: { id: userId } }))) {
    const user = await prisma.user.findFirst({ orderBy: { id: "asc" } });
    userId = user?.id ?? 1;
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
    select: { brand: true, model: true, licensePlate: true },
  });

  const record = await prisma.fuelRecord.create({
    data: {
      vehicleId: data.vehicleId,
      date: data.date,
      fuelType: data.fuelType,
      liters: data.liters,
      pricePerLiter: data.pricePerLiter ?? null,
      totalCost: data.totalCost ?? null,
      mileage: data.mileage ?? null,
      driverName: data.driverName,
      invoiceNumber: data.invoiceNumber || null,
      supplier: data.supplier || null,
      purpose: data.purpose || null,
      createdById: userId,
    },
  });

  const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : `#${data.vehicleId}`;
  await logCreate("FuelRecord", record.id, `Заправка: ${data.liters.toFixed(1)} л на ${vehicleName}, водій «${data.driverName}»`);

  revalidatePath("/fuel");
  revalidatePath(`/fuel/vehicles/${data.vehicleId}`);
  revalidatePath("/fuel/records");
  return { id: record.id };
}

export async function updateFuelRecord(id: number, data: CreateFuelRecordData) {
  await requireModerator();

  const oldRecord = await prisma.fuelRecord.findUnique({
    where: { id },
    include: { vehicle: { select: { brand: true, model: true, licensePlate: true } } },
  });

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
    select: { brand: true, model: true, licensePlate: true },
  });

  const record = await prisma.fuelRecord.update({
    where: { id },
    data: {
      vehicleId: data.vehicleId,
      date: data.date,
      fuelType: data.fuelType,
      liters: data.liters,
      pricePerLiter: data.pricePerLiter ?? null,
      totalCost: data.totalCost ?? null,
      mileage: data.mileage ?? null,
      driverName: data.driverName,
      invoiceNumber: data.invoiceNumber || null,
      supplier: data.supplier || null,
      purpose: data.purpose || null,
    },
  });

  if (oldRecord) {
    const changes = compareFields(
      oldRecord as unknown as Record<string, unknown>,
      data as unknown as Record<string, unknown>,
      ["date", "fuelType", "liters", "pricePerLiter", "totalCost", "mileage", "driverName", "invoiceNumber", "supplier", "purpose"],
    );

    const descriptions = Object.entries(changes).map(
      ([key, val]) => `змінив «${key}» з «${val.old ?? ""}» на «${val.new ?? ""}»`,
    );

    const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : `#${data.vehicleId}`;

    let description: string;
    if (descriptions.length === 0) {
      description = `Оновив заправку №${id} для ${vehicleName} (без змін)`;
    } else if (descriptions.length <= 3) {
      description = `Оновлено заправку №${id} (${vehicleName}): ${descriptions.join("; ")}`;
    } else {
      description = `Оновлено заправку №${id} (${vehicleName}): ${descriptions.slice(0, 3).join("; ")} та ще ${descriptions.length - 3} змін`;
    }

    await logUpdate("FuelRecord", id, description, changes);
  }

  revalidatePath("/fuel");
  revalidatePath(`/fuel/vehicles/${data.vehicleId}`);
  revalidatePath("/fuel/records");
  return { id: record.id };
}

export async function deleteFuelRecord(id: number) {
  await requireModerator();

  const record = await prisma.fuelRecord.delete({
    where: { id },
    include: { vehicle: { select: { brand: true, model: true, licensePlate: true } } },
  });

  const vehicleName = `${record.vehicle.brand} ${record.vehicle.model} (${record.vehicle.licensePlate})`;
  await logDelete("FuelRecord", id, `Видалив заправку: ${record.liters.toFixed(1)} л на ${vehicleName}, водій «${record.driverName}»`);

  revalidatePath("/fuel");
  revalidatePath(`/fuel/vehicles/${record.vehicleId}`);
  revalidatePath("/fuel/records");
  return { id: record.id };
}
