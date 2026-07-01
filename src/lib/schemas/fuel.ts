import { z } from "zod";

const dbString = z.string().nullish().transform((v) => v || null);

const fuelTypeEnum = z.enum(["gasoline-a95", "gasoline-a98", "diesel", "gas", "electric"], { message: "Тип пального обов'язковий" });
const vehicleTypeEnum = z.enum(["car", "truck", "special", "armored", "bus"], { message: "Тип обов'язковий" });

export const createVehicleSchema = z.object({
  brand: z.string().min(1, "Марка обов'язкова"),
  model: z.string().min(1, "Модель обов'язкова"),
  licensePlate: z.string().min(1, "Держномер обов'язковий"),
  type: vehicleTypeEnum,
  year: z.number().int().min(1900).max(2030).optional(),
  vin: dbString,
  fuelType: fuelTypeEnum,
  tankCapacity: z.number().positive("Об'єм баку має бути більше 0").optional(),
  unit: z.string().min(1, "Підрозділ обов'язковий"),
  notes: dbString,
});

export const createFuelRecordSchema = z.object({
  vehicleId: z.number().int().positive("ID транспортного засобу обов'язковий"),
  date: z.string().min(1, "Дата обов'язкова"),
  fuelType: fuelTypeEnum,
  liters: z.number().positive("Кількість літрів має бути більше 0"),
  pricePerLiter: z.number().positive("Ціна має бути більше 0").optional(),
  totalCost: z.number().positive("Вартість має бути більше 0").optional(),
  mileage: z.number().int().nonnegative("Пробіг не може бути від'ємним").optional(),
  driverName: z.string().min(1, "Водій обов'язковий"),
  invoiceNumber: dbString,
  supplier: dbString,
  purpose: dbString,
});

export type CreateVehicleData = z.infer<typeof createVehicleSchema>;
export type CreateFuelRecordData = z.infer<typeof createFuelRecordSchema>;
