import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function seedMilitary() {
  const { MOCK_PERSONNEL } = await import(
    "../components/shared/military/personnel-mock"
  );

  for (let i = 0; i < MOCK_PERSONNEL.length; i++) {
    const person = MOCK_PERSONNEL[i];
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (MOCK_PERSONNEL.length - 1 - i));

    await prisma.militaryPersonnel.create({
      data: {
        createdAt,
        fullName: person.fullName,
        rank: person.rank,
        position: person.position,
        unit: person.unit,
        status: person.status,
        birthDate: person.birthDate,
        photo: person.photo,
        experience: person.experience,
        missions: person.missions,
        phone: person.phone,
        email: person.email,
        lastActiveDays: person.lastActiveDays,
        medicalRecords: person.medicalRecords
          ? {
              create: person.medicalRecords.map((r) => ({
                condition: r.condition,
                diagnosisDate: r.diagnosisDate,
                status: r.status,
                notes: r.notes,
              })),
            }
          : undefined,
        achievements: person.achievements
          ? {
              create: person.achievements.map((a) => ({
                name: a.name,
                date: a.date,
                type: a.type,
                description: a.description,
              })),
            }
          : undefined,
        equipment: person.equipment
          ? {
              create: person.equipment.map((e) => ({
                name: e.name,
                type: e.type,
                serialNumber: e.serialNumber,
                issuedDate: e.issuedDate,
              })),
            }
          : undefined,
        positionHistory: person.positionHistory
          ? {
              create: person.positionHistory.map((p) => ({
                position: p.position,
                unit: p.unit,
                startDate: p.startDate,
                endDate: p.endDate,
              })),
            }
          : undefined,
        clothingSizes: person.clothingSizes
          ? {
              create: {
                height: person.clothingSizes.height,
                chest: person.clothingSizes.chest,
                waist: person.clothingSizes.waist,
                shoes: person.clothingSizes.shoes,
                headgear: person.clothingSizes.headgear,
                uniform: person.clothingSizes.uniform,
              },
            }
          : undefined,
      },
    });
  }

  console.log(`Seeded ${MOCK_PERSONNEL.length} military personnel`);
}

async function seedBzvp() {
  const { BZVP_MOCK } = await import("../components/shared/bzvp/mock");

  for (let i = 0; i < BZVP_MOCK.length; i++) {
    const person = BZVP_MOCK[i];
    const createdAt = new Date();
    createdAt.setMinutes(createdAt.getMinutes() - (BZVP_MOCK.length - 1 - i));

    await prisma.bzvpPersonnel.create({
      data: {
        createdAt,
        fullName: person.fullName,
        rank: person.rank,
        birthDate: person.birthDate,
        birthPlace: person.birthPlace,
        photo: person.photo,
        passport: person.passport,
        passportIssued: person.passportIssued,
        tin: person.tin,
        militaryId: person.militaryId,
        militaryIdIssued: person.militaryIdIssued,
        ubd: person.ubd,
        ubdDate: person.ubdDate,
        serviceUnit: person.serviceUnit,
        serviceYears: person.serviceYears,
        civilianJob: person.civilianJob,
        education: person.education,
        actualAddress: person.actualAddress,
        registrationAddress: person.registrationAddress,
        driverLicense: person.driverLicense,
        criminalRecord: person.criminalRecord,
        policeRecords: person.policeRecords,
        family: person.family,
        phone: person.phone,
        relativePhones: person.relativePhones,
        personalOrder: person.personalOrder,
        conscription: person.conscription,
        health: person.health,
        healthComplaints: person.healthComplaints,
        moralState: person.moralState,
        bloodType: person.bloodType,
        shoeSize: person.shoeSize,
        notes: person.notes,
        status: person.status,
        arrivalDate: person.arrivalDate,
        trainingPeriod: person.trainingPeriod,
        specialization: person.specialization,
      },
    });
  }

  console.log(`Seeded ${BZVP_MOCK.length} bzvp personnel`);
}

async function seedUsers() {
  const bcrypt = await import("bcryptjs");

  await prisma.user.upsert({
    where: { email: "admin@tracker.local" },
    update: {},
    create: {
      email: "admin@tracker.local",
      password: bcrypt.hashSync("admin123", 10),
      name: "Адмін",
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "user@tracker.local" },
    update: {},
    create: {
      email: "user@tracker.local",
      password: bcrypt.hashSync("user123", 10),
      name: "Користувач",
      role: "user",
    },
  });

  console.log("Seeded users");
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.clothingSizes.deleteMany();
  await prisma.positionEntry.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.militaryPersonnel.deleteMany();
  await prisma.bzvpPersonnel.deleteMany();
  await prisma.user.deleteMany();

  await seedUsers();
  await seedMilitary();
  await seedBzvp();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
