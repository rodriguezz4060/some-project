import { z } from "zod";

const optionalField = z.string().optional();

export const createBzvpSchema = z.object({
  fullName: z.string().min(1, "ПІБ обов'язкове"),
  rank: z.string().min(1, "Звання обов'язкове"),
  birthDate: z.string().min(1, "Дата народження обов'язкова"),
  birthPlace: optionalField,
  photo: optionalField,
  passport: optionalField,
  passportIssued: optionalField,
  tin: optionalField,
  militaryId: optionalField,
  militaryIdIssued: optionalField,
  ubd: optionalField,
  ubdDate: optionalField,
  serviceUnit: optionalField,
  serviceYears: optionalField,
  civilianJob: optionalField,
  education: optionalField,
  actualAddress: optionalField,
  registrationAddress: optionalField,
  driverLicense: optionalField,
  criminalRecord: optionalField,
  policeRecords: optionalField,
  family: optionalField,
  phone: optionalField,
  relativePhones: optionalField,
  personalOrder: optionalField,
  conscription: optionalField,
  health: optionalField,
  healthComplaints: optionalField,
  moralState: optionalField,
  bloodType: optionalField,
  shoeSize: optionalField,
  notes: optionalField,
});

export const updateBzvpSchema = createBzvpSchema.extend({
  status: z.string().min(1, "Статус обов'язковий"),
  arrivalDate: z.string().min(1, "Дата прибуття обов'язкова"),
  trainingPeriod: z.string().min(1, "Період навчання обов'язковий"),
  specialization: optionalField,
});

export type CreateBzvpData = z.infer<typeof createBzvpSchema>;
export type UpdateBzvpData = z.infer<typeof updateBzvpSchema>;
