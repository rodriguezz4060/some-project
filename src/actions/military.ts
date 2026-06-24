"use server";

import { prisma } from "@root/lib/prisma";
import { revalidatePath } from "next/cache";

interface MedicalRecordData {
  condition: string;
  diagnosisDate: string;
  status: string;
  notes?: string;
}

interface AchievementData {
  name: string;
  date: string;
  type: string;
  description?: string;
}

interface EquipmentData {
  name: string;
  type: string;
  serialNumber?: string;
  issuedDate: string;
}

interface PositionEntryData {
  position: string;
  unit: string;
  startDate: string;
  endDate?: string;
}

interface ClothingSizesData {
  height?: string;
  chest?: string;
  waist?: string;
  shoes?: string;
  headgear?: string;
  uniform?: string;
}

interface CreateMilitaryData {
  fullName: string;
  rank: string;
  position: string;
  unit: string;
  status: string;
  birthDate: string;
  photo?: string;
  experience?: number;
  missions?: number;
  phone?: string;
  email?: string;
  lastActiveDays?: number;
  medicalRecords?: MedicalRecordData[];
  achievements?: AchievementData[];
  equipment?: EquipmentData[];
  positionHistory?: PositionEntryData[];
  clothingSizes?: ClothingSizesData;
}

async function replaceRelation(
  delegate: { deleteMany: (args: any) => Promise<any>; createMany: (args: any) => Promise<any> },
  personnelId: number,
  items: unknown[],
) {
  await delegate.deleteMany({ where: { personnelId } });
  if (items.length > 0) {
    await delegate.createMany({ data: items });
  }
}

export async function createMilitary(data: CreateMilitaryData) {
  const person = await prisma.militaryPersonnel.create({
    data: {
      fullName: data.fullName,
      rank: data.rank,
      position: data.position,
      unit: data.unit,
      status: data.status,
      birthDate: data.birthDate,
      photo: data.photo || null,
      experience: data.experience ?? null,
      missions: data.missions ?? null,
      phone: data.phone || null,
      email: data.email || null,
      lastActiveDays: data.lastActiveDays ?? null,
      medicalRecords: data.medicalRecords?.length
        ? { createMany: { data: data.medicalRecords.map((r) => ({ ...r, notes: r.notes || null })) } }
        : undefined,
      achievements: data.achievements?.length
        ? { createMany: { data: data.achievements.map((a) => ({ ...a, description: a.description || null })) } }
        : undefined,
      equipment: data.equipment?.length
        ? { createMany: { data: data.equipment.map((e) => ({ ...e, serialNumber: e.serialNumber || null })) } }
        : undefined,
      positionHistory: data.positionHistory?.length
        ? { createMany: { data: data.positionHistory.map((p) => ({ ...p, endDate: p.endDate || null })) } }
        : undefined,
      clothingSizes: data.clothingSizes
        ? { create: { ...data.clothingSizes } }
        : undefined,
    },
  });

  revalidatePath("/military");
  return { id: person.id, fullName: person.fullName };
}

export async function updateMilitary(id: number, data: CreateMilitaryData) {
  const person = await prisma.militaryPersonnel.update({
    where: { id },
    data: {
      fullName: data.fullName,
      rank: data.rank,
      position: data.position,
      unit: data.unit,
      status: data.status,
      birthDate: data.birthDate,
      photo: data.photo || null,
      experience: data.experience ?? null,
      missions: data.missions ?? null,
      phone: data.phone || null,
      email: data.email || null,
      lastActiveDays: data.lastActiveDays ?? null,
    },
  });

  if (data.medicalRecords) {
    await replaceRelation(
      prisma.medicalRecord,
      id,
      data.medicalRecords.map((r) => ({
        personnelId: id,
        condition: r.condition,
        diagnosisDate: r.diagnosisDate,
        status: r.status,
        notes: r.notes || null,
      })),
    );
  }

  if (data.achievements) {
    await replaceRelation(
      prisma.achievement,
      id,
      data.achievements.map((a) => ({
        personnelId: id,
        name: a.name,
        date: a.date,
        type: a.type,
        description: a.description || null,
      })),
    );
  }

  if (data.equipment) {
    await replaceRelation(
      prisma.equipment,
      id,
      data.equipment.map((e) => ({
        personnelId: id,
        name: e.name,
        type: e.type,
        serialNumber: e.serialNumber || null,
        issuedDate: e.issuedDate,
      })),
    );
  }

  if (data.positionHistory) {
    await replaceRelation(
      prisma.positionEntry,
      id,
      data.positionHistory.map((p) => ({
        personnelId: id,
        position: p.position,
        unit: p.unit,
        startDate: p.startDate,
        endDate: p.endDate || null,
      })),
    );
  }

  if (data.clothingSizes) {
    await prisma.clothingSizes.upsert({
      where: { personnelId: id },
      update: { ...data.clothingSizes },
      create: { personnelId: id, ...data.clothingSizes },
    });
  }

  revalidatePath("/military");
  revalidatePath(`/military/${id}`);
  return { id: person.id, fullName: person.fullName };
}

export async function deleteMilitary(id: number) {
  const person = await prisma.militaryPersonnel.delete({ where: { id } });

  revalidatePath("/military");
  return { id: person.id, fullName: person.fullName };
}
