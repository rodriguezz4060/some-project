import { z } from "zod";

const optionalStr = z.string().optional();
const optionalNum = z.number().optional();

export const medicalRecordSchema = z.object({
  condition: z.string().min(1, "Діагноз обов'язковий"),
  diagnosisDate: z.string().min(1, "Дата діагнозу обов'язкова"),
  status: z.string().min(1, "Статус обов'язковий"),
  notes: optionalStr,
});

export const achievementSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  date: z.string().min(1, "Дата обов'язкова"),
  type: z.string().min(1, "Тип обов'язковий"),
  description: optionalStr,
});

export const equipmentSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  type: z.string().min(1, "Тип обов'язковий"),
  serialNumber: optionalStr,
  issuedDate: z.string().min(1, "Дата видачі обов'язкова"),
});

export const positionEntrySchema = z.object({
  position: z.string().min(1, "Посада обов'язкова"),
  unit: z.string().min(1, "Підрозділ обов'язковий"),
  startDate: z.string().min(1, "Дата початку обов'язкова"),
  endDate: optionalStr,
});

export const clothingSizesSchema = z.object({
  height: optionalStr,
  chest: optionalStr,
  waist: optionalStr,
  shoes: optionalStr,
  headgear: optionalStr,
  uniform: optionalStr,
});

export const createMilitarySchema = z.object({
  fullName: z.string().min(1, "ПІБ обов'язкове"),
  rank: z.string().min(1, "Звання обов'язкове"),
  position: z.string().min(1, "Посада обов'язкова"),
  unit: z.string().min(1, "Підрозділ обов'язковий"),
  status: z.string().min(1, "Статус обов'язковий"),
  birthDate: z.string().min(1, "Дата народження обов'язкова"),
  photo: optionalStr,
  experience: optionalNum,
  missions: optionalNum,
  phone: optionalStr,
  email: optionalStr,
  lastActiveDays: optionalNum,
  medicalRecords: z.array(medicalRecordSchema).optional(),
  achievements: z.array(achievementSchema).optional(),
  equipment: z.array(equipmentSchema).optional(),
  positionHistory: z.array(positionEntrySchema).optional(),
  clothingSizes: clothingSizesSchema.optional(),
});

export type CreateMilitaryData = z.infer<typeof createMilitarySchema>;
