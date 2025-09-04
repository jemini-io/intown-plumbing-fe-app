"use server";

import { prisma } from "@/lib/prisma";

export async function getSettings() {
  return prisma.appSetting.findMany({
    orderBy: { id: "asc" },
  });
}

export async function createSetting(data: { key: string; value: string }) {
  await prisma.appSetting.create({ data });
}

export async function updateSetting(id: number, data: { key: string; value: string }) {
  await prisma.appSetting.update({ where: { id }, data });
}

export async function deleteSetting(id: number) {
  await prisma.appSetting.delete({ where: { id } });
}
