/**
 * Repository for Skill entity
 * Encapsulates all database access for Skill
 * Similar to ActiveRecord models in Rails
 */

import { prisma } from "@/lib/prisma";
import { Skill } from "@/lib/types/skill";
import pino from "pino";

const logger = pino({ name: "SkillRepository" });

export class SkillRepository {
  /**
   * Get all skills
   */
  static async findAll(): Promise<Skill[]> {
    const prompt = 'SkillRepository.findAll function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.skill.findMany function...`);
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

    logger.info(`${prompt} Invocation of prisma.skill.findMany function successfully completed.`);
    logger.info(`${prompt} Returning array of ${skills.length} skills to the caller.`);
    return skills.map(skill => ({
      ...skill,
      serviceToJobTypes: skill.serviceToJobTypes.map(rel => rel.serviceToJobType),
      technicians: skill.technicians.map(rel => rel.technician),
    }));
  }

  /**
   * Get skill by ID
   */
  static async findById(id: string): Promise<Skill | null> {
    const prompt = 'SkillRepository.findById function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.skill.findUnique function with ID: ${id}...`);
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

    logger.info(`${prompt} Invocation of prisma.skill.findUnique function successfully completed.`);

    if (!skill) {
      logger.info(`${prompt} No skill found with ID: ${id}. Returning null to the caller.`);
      return null;
    };

    logger.info(`${prompt} Skill found with ID: ${skill?.id}.`);
    logger.info(`${prompt} Returning the skill with ID: ${skill?.id} to the caller.`);
    return {
      ...skill,
      serviceToJobTypes: skill.serviceToJobTypes.map(rel => rel.serviceToJobType),
      enabledServiceToJobTypes: skill.serviceToJobTypes.filter(rel => rel.serviceToJobType.enabled).map(rel => rel.serviceToJobType),
      technicians: skill.technicians.map(rel => rel.technician),
      enabledTechnicians: skill.technicians.filter(rel => rel.technician.enabled).map(rel => rel.technician),
    };
  }

  /**
   * Create a new skill
   */
  static async create(
    data: Omit<Skill, "id" | "serviceToJobTypes" | "technicians"> & {
      serviceIds?: string[];
      technicianIds?: string[];
    }
  ) {
    const { serviceIds, technicianIds, ...skillData } = data;
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

    if (technicianIds && technicianIds.length > 0) {
      await prisma.technicianSkill.createMany({
        data: technicianIds.map(technicianId => ({
          technicianId,
          skillId: createdSkill.id,
        })),
        skipDuplicates: true,
      });
    }

    return createdSkill;
  }

  /**
   * Update a skill
   */
  static async update(
    id: string,
    data: Partial<Omit<Skill, "serviceToJobTypes" | "technicians">> & {
      serviceIds?: string[];
      technicianIds?: string[];
    }
  ) {
    const { serviceIds, technicianIds, ...skillData } = data;

    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: skillData,
    });

    // Update service relations
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

    // Update technician relations
    if (technicianIds) {
      await prisma.technicianSkill.deleteMany({
        where: { skillId: id },
      });
      await prisma.technicianSkill.createMany({
        data: technicianIds.map(technicianId => ({
          technicianId,
          skillId: id,
        })),
        skipDuplicates: true,
      });
    }

    return updatedSkill;
  }

  /**
   * Delete skill service relations
   */
  static async deleteServiceRelations(skillId: string) {
    return prisma.serviceToJobTypeSkill.deleteMany({
      where: { skillId },
    });
  }

  /**
   * Delete skill technician relations
   */
  static async deleteTechnicianRelations(skillId: string) {
    return prisma.technicianSkill.deleteMany({
      where: { skillId },
    });
  }

  /**
   * Delete a skill
   */
  static async delete(id: string) {
    return prisma.skill.delete({
      where: { id },
    });
  }

  /**
   * Unlink a service from a skill
   */
  static async unlinkService(skillId: string, serviceId: string) {
    return prisma.serviceToJobTypeSkill.delete({
      where: {
        serviceToJobTypeId_skillId: {
          serviceToJobTypeId: serviceId,
          skillId,
        },
      },
    });
  }

  /**
   * Unlink a technician from a skill
   */
  static async unlinkTechnician(skillId: string, technicianId: string) {
    return prisma.technicianSkill.delete({
      where: {
        technicianId_skillId: {
          technicianId,
          skillId,
        },
      },
    });
  }
}

