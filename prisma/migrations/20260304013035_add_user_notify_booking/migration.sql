-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "notifyOnBooking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyPhone" TEXT;
