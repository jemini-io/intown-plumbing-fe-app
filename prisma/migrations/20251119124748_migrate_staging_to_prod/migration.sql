-- Step 1: Rename enum Role to UserRole (preserves data)
ALTER TYPE "public"."Role" RENAME TO "UserRole";

-- Step 2: Create new enums
CREATE TYPE "public"."TechnicianStatus" AS ENUM ('ON_JOB', 'ON_ROUTE', 'FINISHED_JOB', 'AWAITING_JOB');
CREATE TYPE "public"."CustomerType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL');
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'SCHEDULED', 'CANCELED', 'COMPLETED');

-- Step 3: Migrate UserImage to Image (preserve data)
-- First, create Image table
CREATE TABLE "public"."Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- Migrate data from UserImage to Image
INSERT INTO "public"."Image" ("id", "url", "publicId", "uploadedAt")
SELECT "id", "url", "publicId", "uploadedAt" FROM "public"."UserImage";

-- Step 4: Update User table
-- Add enabled column with default
ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "enabled" BOOLEAN NOT NULL DEFAULT true;

-- Update foreign key to point to Image instead of UserImage
ALTER TABLE "public"."User" DROP CONSTRAINT IF EXISTS "User_imageId_fkey";
ALTER TABLE "public"."User" ADD CONSTRAINT "User_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 5: Create new tables (before adding foreign keys to Booking)
CREATE TABLE "public"."Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE "public"."ServiceToJobTypeSkill" (
    "serviceToJobTypeId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "ServiceToJobTypeSkill_pkey" PRIMARY KEY ("serviceToJobTypeId","skillId")
);

CREATE TABLE "public"."TechnicianSkill" (
    "technicianId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "TechnicianSkill_pkey" PRIMARY KEY ("technicianId","skillId")
);

CREATE TABLE "public"."PhoneNumber" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhoneNumber_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."EmailAddress" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailAddress_pkey" PRIMARY KEY ("id")
);

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

-- Step 6: Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Skill_name_key" ON "public"."Skill"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Technician_technicianId_key" ON "public"."Technician"("technicianId");
CREATE UNIQUE INDEX IF NOT EXISTS "Technician_imageId_key" ON "public"."Technician"("imageId");
CREATE UNIQUE INDEX IF NOT EXISTS "PhoneNumber_countryCode_number_key" ON "public"."PhoneNumber"("countryCode", "number");
CREATE UNIQUE INDEX IF NOT EXISTS "EmailAddress_address_key" ON "public"."EmailAddress"("address");
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_customerId_key" ON "public"."Customer"("customerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_imageId_key" ON "public"."Customer"("imageId");
CREATE INDEX IF NOT EXISTS "Booking_scheduledFor_idx" ON "public"."Booking"("scheduledFor");

-- Step 7: Add foreign keys for new tables
ALTER TABLE "public"."Technician" ADD CONSTRAINT "Technician_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."ServiceToJobTypeSkill" ADD CONSTRAINT "ServiceToJobTypeSkill_serviceToJobTypeId_fkey" FOREIGN KEY ("serviceToJobTypeId") REFERENCES "public"."ServiceToJobType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."ServiceToJobTypeSkill" ADD CONSTRAINT "ServiceToJobTypeSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."TechnicianSkill" ADD CONSTRAINT "TechnicianSkill_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."TechnicianSkill" ADD CONSTRAINT "TechnicianSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_emailAddressId_fkey" FOREIGN KEY ("emailAddressId") REFERENCES "public"."EmailAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_phoneNumberId_fkey" FOREIGN KEY ("phoneNumberId") REFERENCES "public"."PhoneNumber"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 8: Migrate Booking.status from String to enum
-- First, add new status column with enum type and default
ALTER TABLE "public"."Booking" ADD COLUMN "status_new" "public"."BookingStatus" NOT NULL DEFAULT 'SCHEDULED';

-- Migrate existing status values (map String to enum)
UPDATE "public"."Booking" 
SET "status_new" = CASE 
    WHEN UPPER("status") = 'PENDING' THEN 'PENDING'::"public"."BookingStatus"
    WHEN UPPER("status") = 'SCHEDULED' THEN 'SCHEDULED'::"public"."BookingStatus"
    WHEN UPPER("status") = 'CANCELED' OR UPPER("status") = 'CANCELLED' THEN 'CANCELED'::"public"."BookingStatus"
    WHEN UPPER("status") = 'COMPLETED' THEN 'COMPLETED'::"public"."BookingStatus"
    ELSE 'SCHEDULED'::"public"."BookingStatus"
END;

-- Drop old column and rename new one
ALTER TABLE "public"."Booking" DROP COLUMN "status";
ALTER TABLE "public"."Booking" RENAME COLUMN "status_new" TO "status";

-- Step 9: Add foreign keys to Booking (WARNING: This will fail if Booking has invalid references)
-- These should be added AFTER populating Customer, ServiceToJobType, and Technician tables
-- For now, we'll add them but they may need to be deferred or handled separately
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."ServiceToJobType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 10: Drop UserImage table (data already migrated to Image)
DROP TABLE IF EXISTS "public"."UserImage";
