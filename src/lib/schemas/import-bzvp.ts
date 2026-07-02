import { z } from "zod";

export const UKR_DATE_REGEX = /^\d{2}[./-]\d{2}[./-]\d{4}$/;

export const BZVP_STATUS_VALUES = ["training", "graduated", "transferred", "failed"] as const;

export const BzvpRowSchema = z.object({
  fullName: z.string().min(1),
  rank: z.string().min(1),
  birthDate: z.string().regex(UKR_DATE_REGEX),
  birthPlace: z.string().optional(),
  photo: z.string().optional(),
  passport: z.string().optional(),
  passportIssued: z.string().optional(),
  tin: z.string().optional(),
  militaryId: z.string().optional(),
  militaryIdIssued: z.string().optional(),
  ubd: z.string().optional(),
  ubdDate: z.string().regex(UKR_DATE_REGEX).optional(),
  serviceUnit: z.string().optional(),
  serviceYears: z.string().optional(),
  civilianJob: z.string().optional(),
  education: z.string().optional(),
  actualAddress: z.string().optional(),
  registrationAddress: z.string().optional(),
  driverLicense: z.string().optional(),
  criminalRecord: z.string().optional(),
  policeRecords: z.string().optional(),
  family: z.string().optional(),
  phone: z.string().optional(),
  relativePhones: z.string().optional(),
  personalOrder: z.string().optional(),
  conscription: z.string().optional(),
  health: z.string().optional(),
  healthComplaints: z.string().optional(),
  moralState: z.string().optional(),
  bloodType: z.string().optional(),
  shoeSize: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(BZVP_STATUS_VALUES),
  arrivalDate: z.string().regex(UKR_DATE_REGEX),
  trainingPeriod: z.string().min(1),
  specialization: z.string().optional(),
});
