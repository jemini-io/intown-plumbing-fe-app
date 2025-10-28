"use server";

import { prisma } from "@/lib/prisma";
import { Skill } from "@/lib/types/skill";
import pino from "pino";

const logger = pino({ name: "skills-actions" });

export async function getAllSkills() {
  logger.info("Fetching all skills");
  const skills = await prisma.skill.findMany({
    orderBy: {
      createdAt: "asc",
    },
    include: {
      serviceToJobTypes: {
        include: { serviceToJobType: true },
      },
      technicians: {
        include: { technician: true },
      },
    },
  });

  return skills.map(skill => ({
    ...skill,
    serviceToJobTypes: skill.serviceToJobTypes.map(rel => rel.serviceToJobType),
    technicians: skill.technicians.map(rel => rel.technician),
  }));
}

export async function findSkillById(id: string) {
  logger.info(`Fetching skill with ID: ${id}`);
  const skill = await prisma.skill.findUnique({
    where: { id },
    include: {
      serviceToJobTypes: {
        include: { serviceToJobType: true },
      },
      technicians: {
        include: { technician: true },
      },
    },
  });

  if (!skill) return null;
  return skill;
}

export async function addSkill(
  data: Omit<Skill, "id" | "serviceToJobTypes" | "technicians"> & { serviceIds?: string[] }
) {
  logger.info(`Adding new skill...`);
  const { serviceIds, ...skillData } = data;
  const createdSkill = await prisma.skill.create({ data: skillData });

  if (serviceIds && serviceIds.length > 0) {
    await prisma.serviceToJobTypeSkill.createMany({
      data: serviceIds.map(serviceId => ({
        serviceToJobTypeId: serviceId,
        skillId: createdSkill.id,
      })),
      skipDuplicates: true,
    });
  }

  return createdSkill;
}

export async function updateSkill(
  id: string,
  data: Partial<Omit<Skill, "serviceToJobTypes" | "technicians">> & { serviceIds?: string[] }
) {
  logger.info(`Updating skill with ID: ${id}`);
  const { serviceIds, ...skillData } = data;

  const updatedSkill = await prisma.skill.update({
    where: { id },
    data: skillData,
  });

  if (serviceIds) {
    await prisma.serviceToJobTypeSkill.deleteMany({
      where: { skillId: id },
    });
    await prisma.serviceToJobTypeSkill.createMany({
      data: serviceIds.map(serviceId => ({
        serviceToJobTypeId: serviceId,
        skillId: id,
      })),
      skipDuplicates: true,
    });
  }

  return updatedSkill;
}

export async function deleteSkill(id: string) {
  logger.info(`Deleting skill with ID: ${id}`);
  await prisma.serviceToJobTypeSkill.deleteMany({
    where: { skillId: id },
  });
  await prisma.technicianSkill.deleteMany({
    where: { skillId: id },
  });
  return prisma.skill.delete({
    where: { id },
  });
}

export async function unlinkServiceFromSkill(skillId: string, serviceId: string) {
  await prisma.serviceToJobTypeSkill.delete({
    where: { serviceToJobTypeId_skillId: { serviceToJobTypeId: serviceId, skillId } },
  });
}

export async function unlinkTechnicianFromSkill(skillId: string, technicianId: string) {
  await prisma.technicianSkill.delete({
    where: { technicianId_skillId: { technicianId, skillId } },
  });
}

