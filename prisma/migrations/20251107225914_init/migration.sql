-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."TechnicianStatus" AS ENUM ('ON_JOB', 'ON_ROUTE', 'FINISHED_JOB', 'AWAITING_JOB');

-- CreateEnum
CREATE TYPE "public"."CustomerType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'SCHEDULED', 'CANCELED', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordDigest" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceToJobType" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "serviceTitanId" INTEGER NOT NULL,
    "serviceTitanName" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceToJobType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Technician" (
    "id" TEXT NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "technicianName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageId" TEXT,
    "status" "public"."TechnicianStatus" NOT NULL DEFAULT 'AWAITING_JOB',

    CONSTRAINT "Technician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceToJobTypeSkill" (
    "serviceToJobTypeId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "ServiceToJobTypeSkill_pkey" PRIMARY KEY ("serviceToJobTypeId","skillId")
);

-- CreateTable
CREATE TABLE "public"."TechnicianSkill" (
    "technicianId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "TechnicianSkill_pkey" PRIMARY KEY ("technicianId","skillId")
);

-- CreateTable
CREATE TABLE "public"."AppSetting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PhoneNumber" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhoneNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailAddress" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."CustomerType" NOT NULL DEFAULT 'RESIDENTIAL',
    "emailAddressId" TEXT,
    "phoneNumberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageId" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_imageId_key" ON "public"."User"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "public"."Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Technician_technicianId_key" ON "public"."Technician"("technicianId");

-- CreateIndex
CREATE UNIQUE INDEX "Technician_imageId_key" ON "public"."Technician"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_key_key" ON "public"."AppSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_countryCode_number_key" ON "public"."PhoneNumber"("countryCode", "number");

-- CreateIndex
CREATE UNIQUE INDEX "EmailAddress_address_key" ON "public"."EmailAddress"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerId_key" ON "public"."Customer"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_imageId_key" ON "public"."Customer"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_jobId_key" ON "public"."Booking"("jobId");

-- CreateIndex
CREATE INDEX "Booking_scheduledFor_idx" ON "public"."Booking"("scheduledFor");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Technician" ADD CONSTRAINT "Technician_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceToJobTypeSkill" ADD CONSTRAINT "ServiceToJobTypeSkill_serviceToJobTypeId_fkey" FOREIGN KEY ("serviceToJobTypeId") REFERENCES "public"."ServiceToJobType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceToJobTypeSkill" ADD CONSTRAINT "ServiceToJobTypeSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TechnicianSkill" ADD CONSTRAINT "TechnicianSkill_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TechnicianSkill" ADD CONSTRAINT "TechnicianSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_emailAddressId_fkey" FOREIGN KEY ("emailAddressId") REFERENCES "public"."EmailAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_phoneNumberId_fkey" FOREIGN KEY ("phoneNumberId") REFERENCES "public"."PhoneNumber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."ServiceToJobType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
