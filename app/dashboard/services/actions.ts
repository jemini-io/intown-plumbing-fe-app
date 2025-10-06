"use server";

import { prisma } from "@/lib/prisma";
import { ServiceToJobType } from "@/lib/types/serviceToJobType";
import pino from "pino";

const logger = pino({ name: "serviceToJobTypes-actions" });

const SERVICE_SETTING_KEY = "serviceToJobTypes";

export async function getServiceToJobsTypeSetting() {
  return prisma.appSetting.findUnique({
    where: { key: SERVICE_SETTING_KEY },
  });
}

export async function findServiceById(serviceTitanId: string): Promise<ServiceToJobType | undefined> {
  const setting = await getServiceToJobsTypeSetting();
  const list: ServiceToJobType[] = setting?.value ? JSON.parse(setting.value) : [];
  return list.find((s) => String(s.serviceTitanId) === String(serviceTitanId));
}

export async function addService(newService: ServiceToJobType): Promise<ServiceToJobType[]> {
  const setting = await getServiceToJobsTypeSetting();
  const list: ServiceToJobType[] = setting?.value ? JSON.parse(setting.value) : [];

  if (list.some(s => String(s.serviceTitanId) === String(newService.serviceTitanId))) {
    throw new Error(`Service ID "${newService.serviceTitanId}" already exists`);
  }

  list.push({
    serviceTitanId: String(newService.serviceTitanId),
    displayName: newService.displayName,
    serviceTitanName: newService.serviceTitanName,
    emoji: newService.emoji,
    icon: newService.icon,
    description: newService.description,
    enabled: newService.enabled,
  });

  await prisma.appSetting.upsert({
    where: { key: SERVICE_SETTING_KEY },
    create: { key: SERVICE_SETTING_KEY, value: JSON.stringify(list) },
    update: { value: JSON.stringify(list) },
  });

  return list;
}

export async function updateService(
  originalServiceTitanId: string,
  updated: Partial<ServiceToJobType>
): Promise<ServiceToJobType[]> {
  const setting = await getServiceToJobsTypeSetting();
  const list: ServiceToJobType[] = setting?.value ? JSON.parse(setting.value) : [];

  const idx = list.findIndex(s => String(s.serviceTitanId) === String(originalServiceTitanId));
  if (idx === -1) return list;

  const current = list[idx];

  // Allow ID change if no collision exists
  let nextId = current.serviceTitanId;
  if (updated.serviceTitanId && String(updated.serviceTitanId) !== String(originalServiceTitanId)) {
    const collision = list.some(
      s => String(s.serviceTitanId) === String(updated.serviceTitanId)
    );
    if (collision) {
      throw new Error(`Service ID "${updated.serviceTitanId}" already exists`);
    }
    nextId = String(updated.serviceTitanId);
  }

  const merged: ServiceToJobType = {
    serviceTitanId: String(nextId),
    displayName: updated.displayName ?? current.displayName,
    serviceTitanName: updated.serviceTitanName ?? current.serviceTitanName,
    emoji: updated.emoji ?? current.emoji,
    icon: updated.icon ?? current.icon,
    description: updated.description ?? current.description,
    enabled: updated.enabled ?? current.enabled,
  };

  list[idx] = merged;

  await prisma.appSetting.upsert({
    where: { key: SERVICE_SETTING_KEY },
    create: { key: SERVICE_SETTING_KEY, value: JSON.stringify(list) },
    update: { value: JSON.stringify(list) },
  });

  return list;
}

export async function deleteService(serviceTitanId: string): Promise<ServiceToJobType[]> {
  logger.info(`Deleting service with ID: ${serviceTitanId}`);
  const setting = await getServiceToJobsTypeSetting();
  const list: ServiceToJobType[] = setting?.value ? JSON.parse(setting.value) : [];
  const filtered = list.filter(s => String(s.serviceTitanId) !== String(serviceTitanId));

  await prisma.appSetting.upsert({
    where: { key: SERVICE_SETTING_KEY },
    create: { key: SERVICE_SETTING_KEY, value: JSON.stringify(filtered) },
    update: { value: JSON.stringify(filtered) },
  });

  return filtered;
}