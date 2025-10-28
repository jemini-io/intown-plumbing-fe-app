/*
  Warnings:

  - Changed the type of `serviceTitanId` on the `ServiceToJobType` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."ServiceToJobType" DROP COLUMN "serviceTitanId",
ADD COLUMN     "serviceTitanId" INTEGER NOT NULL;
