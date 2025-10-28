-- CreateTable
CREATE TABLE "public"."ServiceToJobType" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "serviceTitanId" TEXT NOT NULL,
    "serviceTitanName" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceToJobType_pkey" PRIMARY KEY ("id")
);
