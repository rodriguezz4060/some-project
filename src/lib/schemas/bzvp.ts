import { z } from "zod";

const dbString = z.string().nullish().transform((v) => v || null);

export const bzvpSchema = z.object({
  fullName: z.string().min(1, "ПІБ обов'язкове"),
  rank: z.string().min(1, "Звання обов'язкове"),
  birthDate: z.string().min(1, "Дата народження обов'язкова"),
  status: z.string().optional(),
  arrivalDate: z.string().optional(),
  trainingPeriod: z.string().optional(),
  specialization: dbString,
  birthPlace: dbString,
  photo: dbString,
  passport: dbString,
  passportIssued: dbString,
  tin: dbString,
  militaryId: dbString,
  militaryIdIssued: dbString,
  ubd: dbString,
  ubdDate: dbString,
  serviceUnit: dbString,
  serviceYears: dbString,
  civilianJob: dbString,
  education: dbString,
  actualAddress: dbString,
  registrationAddress: dbString,
  driverLicense: dbString,
  criminalRecord: dbString,
  policeRecords: dbString,
  family: dbString,
  phone: dbString,
  relativePhones: dbString,
  personalOrder: dbString,
  conscription: dbString,
  health: dbString,
  healthComplaints: dbString,
  moralState: dbString,
  bloodType: dbString,
  shoeSize: dbString,
  notes: dbString,
});

export type BzvpData = z.infer<typeof bzvpSchema>;
