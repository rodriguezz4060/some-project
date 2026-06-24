"use server";

import { prisma } from "@root/lib/prisma";
import { revalidatePath } from "next/cache";

interface CreateBzvpData {
  rank: string;
  fullName: string;
  birthDate: string;
  birthPlace: string;
  photo: string;
  passport: string;
  passportIssued: string;
  tin: string;
  militaryId: string;
  militaryIdIssued: string;
  ubd: string;
  ubdDate: string;
  serviceUnit: string;
  serviceYears: string;
  civilianJob: string;
  education: string;
  actualAddress: string;
  registrationAddress: string;
  driverLicense: string;
  criminalRecord: string;
  policeRecords: string;
  family: string;
  phone: string;
  relativePhones: string;
  personalOrder: string;
  conscription: string;
  health: string;
  healthComplaints: string;
  moralState: string;
  bloodType: string;
  shoeSize: string;
  notes: string;
}

export async function createBzvp(data: CreateBzvpData) {
  const today = new Date().toISOString().split("T")[0];

  const person = await prisma.bzvpPersonnel.create({
    data: {
      fullName: data.fullName,
      rank: data.rank,
      birthDate: data.birthDate,
      birthPlace: data.birthPlace || null,
      photo: data.photo || null,
      passport: data.passport || null,
      passportIssued: data.passportIssued || null,
      tin: data.tin || null,
      militaryId: data.militaryId || null,
      militaryIdIssued: data.militaryIdIssued || null,
      ubd: data.ubd || null,
      ubdDate: data.ubdDate || null,
      serviceUnit: data.serviceUnit || null,
      serviceYears: data.serviceYears || null,
      civilianJob: data.civilianJob || null,
      education: data.education || null,
      actualAddress: data.actualAddress || null,
      registrationAddress: data.registrationAddress || null,
      driverLicense: data.driverLicense || null,
      criminalRecord: data.criminalRecord || null,
      policeRecords: data.policeRecords || null,
      family: data.family || null,
      phone: data.phone || null,
      relativePhones: data.relativePhones || null,
      personalOrder: data.personalOrder || null,
      conscription: data.conscription || null,
      health: data.health || null,
      healthComplaints: data.healthComplaints || null,
      moralState: data.moralState || null,
      bloodType: data.bloodType || null,
      shoeSize: data.shoeSize || null,
      notes: data.notes || null,
      status: "training",
      arrivalDate: today,
      trainingPeriod: "",
      specialization: null,
    },
  });

  revalidatePath("/bzvp");
  return { id: person.id, fullName: person.fullName };
}

interface UpdateBzvpData extends CreateBzvpData {
  status: string;
  arrivalDate: string;
  trainingPeriod: string;
  specialization: string;
}

export async function updateBzvp(id: number, data: UpdateBzvpData) {
  const person = await prisma.bzvpPersonnel.update({
    where: { id },
    data: {
      fullName: data.fullName,
      rank: data.rank,
      birthDate: data.birthDate,
      birthPlace: data.birthPlace || null,
      photo: data.photo || null,
      passport: data.passport || null,
      passportIssued: data.passportIssued || null,
      tin: data.tin || null,
      militaryId: data.militaryId || null,
      militaryIdIssued: data.militaryIdIssued || null,
      ubd: data.ubd || null,
      ubdDate: data.ubdDate || null,
      serviceUnit: data.serviceUnit || null,
      serviceYears: data.serviceYears || null,
      civilianJob: data.civilianJob || null,
      education: data.education || null,
      actualAddress: data.actualAddress || null,
      registrationAddress: data.registrationAddress || null,
      driverLicense: data.driverLicense || null,
      criminalRecord: data.criminalRecord || null,
      policeRecords: data.policeRecords || null,
      family: data.family || null,
      phone: data.phone || null,
      relativePhones: data.relativePhones || null,
      personalOrder: data.personalOrder || null,
      conscription: data.conscription || null,
      health: data.health || null,
      healthComplaints: data.healthComplaints || null,
      moralState: data.moralState || null,
      bloodType: data.bloodType || null,
      shoeSize: data.shoeSize || null,
      notes: data.notes || null,
      status: data.status,
      arrivalDate: data.arrivalDate,
      trainingPeriod: data.trainingPeriod,
      specialization: data.specialization || null,
    },
  });

  revalidatePath("/bzvp");
  return { id: person.id, fullName: person.fullName };
}

export async function deleteBzvp(id: number) {
  const person = await prisma.bzvpPersonnel.delete({ where: { id } });

  revalidatePath("/bzvp");
  return { id: person.id, fullName: person.fullName };
}
