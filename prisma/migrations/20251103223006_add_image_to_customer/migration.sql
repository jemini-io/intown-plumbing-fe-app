/*
  Warnings:

  - A unique constraint covering the columns `[imageId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - Made the column `customerId` on table `Booking` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_customerId_fkey";

-- AlterTable
ALTER TABLE "public"."Booking" ALTER COLUMN "customerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "imageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_imageId_key" ON "public"."Customer"("imageId");

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."UserImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
