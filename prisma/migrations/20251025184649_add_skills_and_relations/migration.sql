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
CREATE TABLE "public"."Technician" (
    "id" TEXT NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "technicianName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "public"."Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Technician_technicianId_key" ON "public"."Technician"("technicianId");

-- AddForeignKey
ALTER TABLE "public"."ServiceToJobTypeSkill" ADD CONSTRAINT "ServiceToJobTypeSkill_serviceToJobTypeId_fkey" FOREIGN KEY ("serviceToJobTypeId") REFERENCES "public"."ServiceToJobType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceToJobTypeSkill" ADD CONSTRAINT "ServiceToJobTypeSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TechnicianSkill" ADD CONSTRAINT "TechnicianSkill_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TechnicianSkill" ADD CONSTRAINT "TechnicianSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
