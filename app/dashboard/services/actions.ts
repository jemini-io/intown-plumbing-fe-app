"use server";

import { prisma } from "@/lib/prisma";
import { ServiceToJobType } from "@/lib/types/serviceToJobType";
import pino from "pino";

const logger = pino({ name: "serviceToJobTypes-actions" });

export async function getServiceToJobsTypeSetting() {
  return await prisma.appSetting.findUnique({
    where: { key: "serviceToJobTypes" },
  });
}

// Find a service by ID
export async function findServiceById(serviceTitanId: string): Promise<ServiceToJobType | undefined> {
  const serviceToJobsTypeSetting = await getServiceToJobsTypeSetting();
  const services = serviceToJobsTypeSetting ? JSON.parse(serviceToJobsTypeSetting.value) as ServiceToJobType[] : [];
  return services.find((s) => s.serviceTitanId === serviceTitanId);
}

// Add a new service
export async function addService(newService: ServiceToJobType): Promise<ServiceToJobType[]> {
  const serviceToJobsTypeSetting = await getServiceToJobsTypeSetting();
  const services = serviceToJobsTypeSetting ? JSON.parse(serviceToJobsTypeSetting.value) as ServiceToJobType[] : [];
  services.push(newService);
  await prisma.appSetting.update({
    where: { key: "serviceToJobTypes" },
    data: { value: JSON.stringify(services) },
  });
  return services;
}

// Update an existing service
export async function updateService(serviceTitanId: string, updated: Partial<ServiceToJobType>): Promise<ServiceToJobType[]> {
  const serviceToJobsTypeSetting = await getServiceToJobsTypeSetting();
  const services = serviceToJobsTypeSetting ? JSON.parse(serviceToJobsTypeSetting.value) as ServiceToJobType[] : [];
  const idx = services.findIndex((s) => s.serviceTitanId === serviceTitanId);
  if (idx === -1) return services;
  services[idx] = { ...services[idx], ...updated };
  await prisma.appSetting.update({
    where: { key: "serviceToJobTypes" },
    data: { value: JSON.stringify(services) },
  });
  return services;
}

// Delete a service by ID
export async function deleteService(serviceTitanId: string): Promise<ServiceToJobType[]> {
  logger.info(`Deleting service with ID: ${serviceTitanId}`);
  const serviceToJobsTypeSetting = await getServiceToJobsTypeSetting();
  const services = serviceToJobsTypeSetting ? JSON.parse(serviceToJobsTypeSetting.value) as ServiceToJobType[] : [];
  const filtered = services.filter((s) => s.serviceTitanId !== serviceTitanId);
  await prisma.appSetting.update({
    where: { key: "serviceToJobTypes" },
    data: { value: JSON.stringify(filtered) },
  });
  return filtered;
}