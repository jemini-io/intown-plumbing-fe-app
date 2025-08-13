"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AppSettingCreateSchema, AppSettingUpdateSchema } from "@/lib/schemas/app-settings";

export async function createSetting(raw: unknown) {
  await requireAdmin();
  const parsed = AppSettingCreateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const { key, value } = parsed.data;
  const rec = await prisma.appSetting.create({ data: { key, value } });
  revalidatePath("/admin/settings");
  return { ok: true as const, data: rec };
}

export async function updateSetting(raw: unknown) {
  await requireAdmin();
  const parsed = AppSettingUpdateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const { id, value } = parsed.data;
  const rec = await prisma.appSetting.update({ where: { id }, data: { value } });
  revalidatePath("/admin/settings");
  return { ok: true as const, data: rec };
}

export async function deleteSetting(id: string) {
  await requireAdmin();
  await prisma.appSetting.delete({ where: { id } });
  revalidatePath("/admin/settings");
  return { ok: true as const };
}
