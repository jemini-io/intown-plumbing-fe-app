"use server";

import { prisma } from "@/lib/prisma";
import { ServiceToJobType } from "@/lib/types/serviceToJobType";
import pino from "pino";

const logger = pino({ name: "serviceToJobTypes-actions" });

export async function getAllServiceToJobTypes() {
  const prompt = 'getAllServiceToJobTypes function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking prisma.serviceToJobType.findMany...`);
  const services = await prisma.serviceToJobType.findMany({
    orderBy: {
      createdAt: "asc",
    },
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });

  logger.info(`${prompt} Successfully completed. Returning array of ${services.length} services to job types to the caller.`);
  return services.map(service => ({
    ...service,
    skills: service.skills.map(rel => rel.skill),
  }));
}

export async function getEnabledServiceToJobTypeOnly() {
  const prompt = 'getEnabledServiceToJobTypeOnly function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking prisma.serviceToJobType.findMany with where: { enabled: true }...`);
  const services = await prisma.serviceToJobType.findMany({
    where: { enabled: true },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });
  logger.info(`${prompt} Successfully completed. Returning array of ${services.length} enabled services to job types to the caller.`);
  return services.map(service => ({
    ...service,
    skills: service.skills.map(rel => rel.skill),
  }));
}

// Optimized function for dropdowns - only fetches id, displayName, and enabled
export async function getServicesForDropdown() {
  return prisma.serviceToJobType.findMany({
    where: {
      enabled: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      displayName: true,
      enabled: true,
    },
  });
}

export async function findServiceById(id: string) {
  logger.info(`Fetching service with ID: ${id}`);
  const service = await prisma.serviceToJobType.findUnique({
    where: { id },
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });

  if (!service) return null;
  return {
    ...service,
    skills: service.skills.map(rel => rel.skill),
  };
}

export async function addService(
  data: Omit<ServiceToJobType, "id" | "skills"> & { skillIds?: string[] }
) {
  const prompt = "addService function says:";
  logger.info(`${prompt} Starting...`);

  const { skillIds, ...serviceData } = data;
  logger.info({ serviceData }, `${prompt} Invoking prisma.serviceToJobType.create with data:`);
  const createdService = await prisma.serviceToJobType.create({ data: serviceData });

  if (skillIds && skillIds.length > 0) {
    await prisma.serviceToJobTypeSkill.createMany({
      data: skillIds.map(skillId => ({
        serviceToJobTypeId: createdService.id,
        skillId,
      })),
      skipDuplicates: true,
    });
  }

  return createdService;
}

export async function updateService(
  id: string,
  data: Partial<Omit<ServiceToJobType, "skills">> & { skillIds?: string[] }
) {
  logger.info(`Updating service with ID: ${id}`);
  const { skillIds, ...serviceData } = data;

  const updatedService = await prisma.serviceToJobType.update({
    where: { id },
    data: serviceData,
  });

  if (skillIds) {
    await prisma.serviceToJobTypeSkill.deleteMany({
      where: { serviceToJobTypeId: id },
    });
    await prisma.serviceToJobTypeSkill.createMany({
      data: skillIds.map(skillId => ({
        serviceToJobTypeId: id,
        skillId,
      })),
      skipDuplicates: true,
    });
  }

  return updatedService;
}

export async function deleteService(id: string) {
  logger.info(`Deleting service with ID: ${id}`);
  // Elimina primero las asociaciones en la tabla intermedia
  await prisma.serviceToJobTypeSkill.deleteMany({
    where: { serviceToJobTypeId: id },
  });
  // Ahora elimina el service
  return prisma.serviceToJobType.delete({
    where: { id },
  });
}

export async function unlinkSkillFromService(serviceId: string, skillId: string) {
  // Elimina solo la relación, no el skill ni el service
  await prisma.serviceToJobTypeSkill.delete({
    where: {
      serviceToJobTypeId_skillId: {
        serviceToJobTypeId: serviceId,
        skillId: skillId,
      },
    },
  });
}

