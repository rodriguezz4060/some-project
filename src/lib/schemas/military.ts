import { z } from "zod";

const dbString = z.string().nullish().transform((v) => v || null);
const optionalNum = z.number().optional();

const statusEnum = z.enum(["active", "on-mission", "wounded", "vacation", "reserve"]);
const rankEnum = z.enum(["старший лейтенант", "капітан", "сержант", "майор", "полковник", "лейтенант"]);

export const medicalRecordSchema = z.object({
  condition: z.string().min(1, "Діагноз обов'язковий"),
  diagnosisDate: z.string().min(1, "Дата діагнозу обов'язкова"),
  status: z.enum(["active", "resolved"]),
  notes: dbString,
});

export const achievementSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  date: z.string().min(1, "Дата обов'язкова"),
  type: z.enum(["medal", "commendation", "certificate"]),
  description: dbString,
});

export const equipmentSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  type: z.enum(["weapon", "armor", "gear"]),
  serialNumber: dbString,
  issuedDate: z.string().min(1, "Дата видачі обов'язкова"),
});

export const positionEntrySchema = z.object({
  position: z.string().min(1, "Посада обов'язкова"),
  unit: z.string().min(1, "Підрозділ обов'язковий"),
  startDate: z.string().min(1, "Дата початку обов'язкова"),
  endDate: dbString,
});

export const clothingSizesSchema = z.object({
  height: dbString,
  chest: dbString,
  waist: dbString,
  shoes: dbString,
  headgear: dbString,
  uniform: dbString,
});

export const createMilitarySchema = z.object({
  fullName: z.string().min(1, "ПІБ обов'язкове"),
  rank: rankEnum,
  position: z.string().min(1, "Посада обов'язкова"),
  unit: z.string().min(1, "Підрозділ обов'язковий"),
  status: statusEnum,
  birthDate: z.string().min(1, "Дата народження обов'язкова"),
  photo: dbString,
  experience: optionalNum,
  missions: optionalNum,
  phone: dbString,
  email: z.email("Невірний формат електронної пошти").nullish().transform((v) => v || null),
  lastActiveDays: optionalNum,
  medicalRecords: z.array(medicalRecordSchema).optional(),
  achievements: z.array(achievementSchema).optional(),
  equipment: z.array(equipmentSchema).optional(),
  positionHistory: z.array(positionEntrySchema).optional(),
  clothingSizes: clothingSizesSchema.optional(),
});

export type CreateMilitaryData = z.infer<typeof createMilitarySchema>;
