import { z } from "zod";

export const createVehicleSchema = z.object({
  brand: z.string().min(1, "Марка обов'язкова"),
  model: z.string().min(1, "Модель обов'язкова"),
  licensePlate: z.string().min(1, "Держномер обов'язковий"),
  type: z.string().min(1, "Тип обов'язковий"),
  year: z.number().int().min(1900).max(2030).optional(),
  vin: z.string().optional(),
  fuelType: z.string().min(1, "Тип пального обов'язковий"),
  tankCapacity: z.number().positive("Об'єм баку має бути більше 0").optional(),
  unit: z.string().min(1, "Підрозділ обов'язковий"),
  notes: z.string().optional(),
});

export const createFuelRecordSchema = z.object({
  vehicleId: z.number().int().positive("ID транспортного засобу обов'язковий"),
  date: z.string().min(1, "Дата обов'язкова"),
  fuelType: z.string().min(1, "Тип пального обов'язковий"),
  liters: z.number().positive("Кількість літрів має бути більше 0"),
  pricePerLiter: z.number().positive("Ціна має бути більше 0").optional(),
  totalCost: z.number().positive("Вартість має бути більше 0").optional(),
  mileage: z.number().int().nonnegative("Пробіг не може бути від'ємним").optional(),
  driverName: z.string().min(1, "Водій обов'язковий"),
  invoiceNumber: z.string().optional(),
  supplier: z.string().optional(),
  purpose: z.string().optional(),
});

export type CreateVehicleData = z.infer<typeof createVehicleSchema>;
export type CreateFuelRecordData = z.infer<typeof createFuelRecordSchema>;
