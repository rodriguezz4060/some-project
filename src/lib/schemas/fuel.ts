import { z } from "zod";

const dbString = z.string().nullish().transform((v) => v || null);

const fuelTypeEnum = z.enum(["gasoline-a95", "gasoline-a98", "diesel", "gas", "electric"], { message: "Тип пального обов'язковий" });
const vehicleTypeEnum = z.enum(["car", "truck", "special", "armored", "bus"], { message: "Тип обов'язковий" });

const preprocessNum = <T extends z.ZodType<number>>(schema: T) =>
  z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), schema.optional());

export const createVehicleSchema = z.object({
  brand: z.string().min(1, "Марка обов'язкова"),
  model: z.string().min(1, "Модель обов'язкова"),
  licensePlate: z.string().min(1, "Держномер обов'язковий"),
  type: vehicleTypeEnum,
  year: preprocessNum(z.number().int().min(1900).max(2030)),
  vin: dbString,
  fuelType: fuelTypeEnum,
  tankCapacity: preprocessNum(z.number().positive("Об'єм баку має бути більше 0")),
  unit: z.string().min(1, "Підрозділ обов'язковий"),
  notes: dbString,
});

export const createFuelRecordSchema = z.object({
  vehicleId: z.number().int().positive("ID транспортного засобу обов'язковий"),
  date: z.string().min(1, "Дата обов'язкова"),
  fuelType: fuelTypeEnum,
  liters: z.number().positive("Кількість літрів має бути більше 0"),
  pricePerLiter: preprocessNum(z.number().positive("Ціна має бути більше 0")),
  totalCost: preprocessNum(z.number().positive("Вартість має бути більше 0")),
  mileage: preprocessNum(z.number().int().nonnegative("Пробіг не може бути від'ємним")),
  driverName: z.string().min(1, "Водій обов'язковий"),
  invoiceNumber: dbString,
  supplier: dbString,
  purpose: dbString,
});

export type CreateVehicleData = z.infer<typeof createVehicleSchema>;
export type CreateFuelRecordData = z.infer<typeof createFuelRecordSchema>;
