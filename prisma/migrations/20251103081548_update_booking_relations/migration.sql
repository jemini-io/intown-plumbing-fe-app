-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "serviceLocalId" TEXT,
ADD COLUMN     "technicianLocalId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."ServiceToJobType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
