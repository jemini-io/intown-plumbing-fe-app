"use server";

import { prisma } from "@/lib/prisma";
import { TechnicianToSkills } from "@/lib/types/technicianToSkills";
import pino from "pino";

const logger = pino({ name: "technician-actions" });

export async function getAllTechnicians() {
  logger.info("Fetching all technicians");
  const technicians = await prisma.technician.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });

  return technicians.map(tech => ({
    ...tech,
    skills: tech.skills.map(rel => rel.skill),
  }));
}

export async function findTechnicianById(id: string) {
  logger.info(`Fetching technician with ID: ${id}`);
  const technician = await prisma.technician.findUnique({
    where: { id },
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });

  if (!technician) return null;
  return {
    ...technician,
    skills: technician.skills.map(rel => rel.skill),
  };
}

export async function addTechnician(
  data: Omit<TechnicianToSkills, "id" | "skills"> & { skillIds?: string[] }
) {
  logger.info(`Adding new technician...`);
  const { skillIds, ...technicianData } = data;
  const createdTechnician = await prisma.technician.create({ data: technicianData });

  if (skillIds && skillIds.length > 0) {
    await prisma.technicianSkill.createMany({
      data: skillIds.map(skillId => ({
        technicianId: createdTechnician.id,
        skillId,
      })),
      skipDuplicates: true,
    });
  }

  return createdTechnician;
}

export async function updateTechnician(
  id: string,
  data: Partial<Omit<TechnicianToSkills, "skills">> & { skillIds?: string[] }
) {
  logger.info(`Updating technician with ID: ${id}`);
  const { skillIds, ...technicianData } = data;

  const updatedTechnician = await prisma.technician.update({
    where: { id },
    data: technicianData,
  });

  if (skillIds) {
    await prisma.technicianSkill.deleteMany({
      where: { technicianId: id },
    });
    await prisma.technicianSkill.createMany({
      data: skillIds.map(skillId => ({
        technicianId: id,
        skillId,
      })),
      skipDuplicates: true,
    });
  }

  return updatedTechnician;
}

export async function deleteTechnician(id: string) {
  logger.info(`Deleting technician with ID: ${id}`);
  await prisma.technicianSkill.deleteMany({
    where: { technicianId: id },
  });
  return prisma.technician.delete({
    where: { id },
  });
}

export async function unlinkSkillFromTechnician(technicianId: string, skillId: string) {
  await prisma.technicianSkill.delete({
    where: { technicianId_skillId: { technicianId, skillId } },
  });
}
