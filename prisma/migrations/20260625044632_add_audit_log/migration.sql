/*
  Warnings:

  - The primary key for the `Achievement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Achievement` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `BzvpPersonnel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `BzvpPersonnel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ClothingSizes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ClothingSizes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Equipment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Equipment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `MedicalRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `MedicalRecord` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `MilitaryPersonnel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `MilitaryPersonnel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `PositionEntry` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `PositionEntry` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `personnelId` on the `Achievement` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `personnelId` on the `ClothingSizes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `personnelId` on the `Equipment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `personnelId` on the `MedicalRecord` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `personnelId` on the `PositionEntry` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'user');

-- DropForeignKey
ALTER TABLE "Achievement" DROP CONSTRAINT "Achievement_personnelId_fkey";

-- DropForeignKey
ALTER TABLE "ClothingSizes" DROP CONSTRAINT "ClothingSizes_personnelId_fkey";

-- DropForeignKey
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_personnelId_fkey";

-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_personnelId_fkey";

-- DropForeignKey
ALTER TABLE "PositionEntry" DROP CONSTRAINT "PositionEntry_personnelId_fkey";

-- AlterTable
ALTER TABLE "Achievement" DROP CONSTRAINT "Achievement_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "personnelId",
ADD COLUMN     "personnelId" INTEGER NOT NULL,
ADD CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "BzvpPersonnel" DROP CONSTRAINT "BzvpPersonnel_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "BzvpPersonnel_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ClothingSizes" DROP CONSTRAINT "ClothingSizes_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "personnelId",
ADD COLUMN     "personnelId" INTEGER NOT NULL,
ADD CONSTRAINT "ClothingSizes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "personnelId",
ADD COLUMN     "personnelId" INTEGER NOT NULL,
ADD CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "personnelId",
ADD COLUMN     "personnelId" INTEGER NOT NULL,
ADD CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MilitaryPersonnel" DROP CONSTRAINT "MilitaryPersonnel_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "MilitaryPersonnel_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PositionEntry" DROP CONSTRAINT "PositionEntry_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "personnelId",
ADD COLUMN     "personnelId" INTEGER NOT NULL,
ADD CONSTRAINT "PositionEntry_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER,
    "description" TEXT NOT NULL,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

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

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
