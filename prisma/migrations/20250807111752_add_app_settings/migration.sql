-- CreateTable
CREATE TABLE "public"."AppSetting" (
    "id" SERIAL NOT NULL,
    "env" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_env_key_key" ON "public"."AppSetting"("env", "key");
