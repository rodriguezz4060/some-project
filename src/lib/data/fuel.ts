import { prisma } from "@root/lib/prisma";
import type { Vehicle, FuelRecord } from "@/components/shared/fuel/types";

export async function getVehicles(status?: string): Promise<Vehicle[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: status ? { status } : { status: "active" },
    orderBy: { createdAt: "desc" },
    include: {
      fuelRecords: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 5,
      },
    },
  });

  return vehicles.map((v) => {
    const records = v.fuelRecords as FuelRecord[];
    const totalLiters = records.reduce((sum, r) => sum + r.liters, 0);
    const totalCost = records.reduce((sum, r) => sum + (r.totalCost ?? 0), 0);

    return {
      ...v,
      year: v.year ?? null,
      vin: v.vin ?? null,
      tankCapacity: v.tankCapacity ?? null,
      notes: v.notes ?? null,
      fuelRecords: records,
      _fuelSummary: {
        totalLiters,
        totalCost,
        recordCount: records.length,
        lastRecordDate: records.length > 0 ? records[0].date : null,
      },
    } as Vehicle;
  });
}

export async function getVehicleById(id: number): Promise<Vehicle | null> {
  const v = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      fuelRecords: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 20,
        include: {
          createdBy: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!v) return null;

  const records = v.fuelRecords as FuelRecord[];
  const totalLiters = records.reduce((sum, r) => sum + r.liters, 0);
  const totalCost = records.reduce((sum, r) => sum + (r.totalCost ?? 0), 0);

  return {
    ...v,
    year: v.year ?? null,
    vin: v.vin ?? null,
    tankCapacity: v.tankCapacity ?? null,
    notes: v.notes ?? null,
    fuelRecords: records,
    _fuelSummary: {
      totalLiters,
      totalCost,
      recordCount: records.length,
      lastRecordDate: records.length > 0 ? records[0].date : null,
    },
  } as Vehicle;
}

export async function getFuelRecords(options?: {
  vehicleId?: number;
  fuelType?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<FuelRecord[]> {
  const where: Record<string, unknown> = {};

  if (options?.vehicleId) where.vehicleId = options.vehicleId;
  if (options?.fuelType) where.fuelType = options.fuelType;

  if (options?.dateFrom || options?.dateTo) {
    const dateFilter: Record<string, string> = {};
    if (options.dateFrom) dateFilter.gte = options.dateFrom;
    if (options.dateTo) dateFilter.lte = options.dateTo;
    where.date = dateFilter;
  }

  const records = await prisma.fuelRecord.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 500,
    include: {
      vehicle: { select: { id: true, brand: true, model: true, licensePlate: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return records as FuelRecord[];
}

export async function getFuelRecordById(id: number): Promise<FuelRecord | null> {
  const r = await prisma.fuelRecord.findUnique({
    where: { id },
    include: {
      vehicle: { select: { id: true, brand: true, model: true, licensePlate: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return r as FuelRecord | null;
}

export async function getVehicleStats() {
  const [vehicles, records] = await Promise.all([
    prisma.vehicle.findMany({
      select: {
        id: true,
        brand: true,
        model: true,
        licensePlate: true,
        fuelType: true,
        unit: true,
      },
    }),
    prisma.fuelRecord.findMany({
      select: {
        id: true,
        liters: true,
        totalCost: true,
        date: true,
        vehicleId: true,
      },
    }),
  ]);

  const totalLiters = records.reduce((sum, r) => sum + r.liters, 0);
  const totalCost = records.reduce((sum, r) => sum + (r.totalCost ?? 0), 0);

  const recordsByVehicle = new Map<number, { liters: number; cost: number; count: number }>();
  for (const r of records) {
    const prev = recordsByVehicle.get(r.vehicleId) ?? { liters: 0, cost: 0, count: 0 };
    prev.liters += r.liters;
    prev.cost += r.totalCost ?? 0;
    prev.count += 1;
    recordsByVehicle.set(r.vehicleId, prev);
  }

  return {
    totalVehicles: vehicles.length,
    totalRecords: records.length,
    totalLiters: Math.round(totalLiters * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    vehicles: vehicles.map((v) => ({
      ...v,
      stats: recordsByVehicle.get(v.id) ?? { liters: 0, cost: 0, count: 0 },
    })),
  };
}
