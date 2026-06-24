-- CreateTable
CREATE TABLE "BzvpPersonnel" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "birthPlace" TEXT,
    "photo" TEXT,
    "passport" TEXT,
    "passportIssued" TEXT,
    "tin" TEXT,
    "militaryId" TEXT,
    "militaryIdIssued" TEXT,
    "ubd" TEXT,
    "ubdDate" TEXT,
    "serviceUnit" TEXT,
    "serviceYears" TEXT,
    "civilianJob" TEXT,
    "education" TEXT,
    "actualAddress" TEXT,
    "registrationAddress" TEXT,
    "driverLicense" TEXT,
    "criminalRecord" TEXT,
    "policeRecords" TEXT,
    "family" TEXT,
    "phone" TEXT,
    "relativePhones" TEXT,
    "personalOrder" TEXT,
    "conscription" TEXT,
    "health" TEXT,
    "healthComplaints" TEXT,
    "moralState" TEXT,
    "bloodType" TEXT,
    "shoeSize" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL,
    "arrivalDate" TEXT NOT NULL,
    "trainingPeriod" TEXT NOT NULL,
    "specialization" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BzvpPersonnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MilitaryPersonnel" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "photo" TEXT,
    "experience" INTEGER,
    "missions" INTEGER,
    "phone" TEXT,
    "email" TEXT,
    "lastActiveDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MilitaryPersonnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "diagnosisDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "personnelId" TEXT NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "personnelId" TEXT NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "serialNumber" TEXT,
    "issuedDate" TEXT NOT NULL,
    "personnelId" TEXT NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositionEntry" (
    "id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "personnelId" TEXT NOT NULL,

    CONSTRAINT "PositionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClothingSizes" (
    "id" TEXT NOT NULL,
    "height" TEXT,
    "chest" TEXT,
    "waist" TEXT,
    "shoes" TEXT,
    "headgear" TEXT,
    "uniform" TEXT,
    "personnelId" TEXT NOT NULL,

    CONSTRAINT "ClothingSizes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClothingSizes_personnelId_key" ON "ClothingSizes"("personnelId");

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "MilitaryPersonnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "MilitaryPersonnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "MilitaryPersonnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionEntry" ADD CONSTRAINT "PositionEntry_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "MilitaryPersonnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClothingSizes" ADD CONSTRAINT "ClothingSizes_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "MilitaryPersonnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
