/*
  Warnings:

  - A unique constraint covering the columns `[imageId]` on the table `Technician` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."TechnicianStatus" AS ENUM ('ON_JOB', 'ON_ROUTE', 'FINISHED_JOB', 'AWAITING_JOB');

-- AlterTable
ALTER TABLE "public"."Technician" ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "status" "public"."TechnicianStatus" NOT NULL DEFAULT 'AWAITING_JOB';

-- CreateIndex
CREATE UNIQUE INDEX "Technician_imageId_key" ON "public"."Technician"("imageId");

-- AddForeignKey
ALTER TABLE "public"."Technician" ADD CONSTRAINT "Technician_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."UserImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
