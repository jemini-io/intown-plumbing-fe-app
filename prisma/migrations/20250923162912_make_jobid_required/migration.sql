/*
  Warnings:

  - Made the column `jobId` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `technicianId` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `revenue` on table `Booking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Booking" ALTER COLUMN "jobId" SET NOT NULL,
ALTER COLUMN "technicianId" SET NOT NULL,
ALTER COLUMN "revenue" SET NOT NULL;
