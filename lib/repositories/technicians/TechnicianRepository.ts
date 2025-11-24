/**
 * Repository for Technician entity
 * Encapsulates all database access for Technician
 * Similar to ActiveRecord models in Rails
 */

import { prisma } from "@/lib/prisma";
import { TechnicianToSkills } from "@/lib/types/technicianToSkills";
import pino from "pino";

const logger = pino({ name: "TechnicianRepository" });

export class TechnicianRepository {
  /**
   * Get all technicians
   */
  static async findAll(): Promise<TechnicianToSkills[]> {
    const technicians = await prisma.technician.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        skills: {
          include: { skill: true },
        },
        image: true,
      },
    });

    return technicians.map(tech => ({
      ...tech,
      skills: tech.skills.map(rel => rel.skill),
      status: tech.status as TechnicianToSkills["status"],
    }));
  }

  /**
   * Get all enabled technicians
   */
  static async findEnabled(): Promise<TechnicianToSkills[]> {
    const prompt = 'TechnicianRepository.findEnabled function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.technician.findMany function with "where: { enabled: true }"...`);
    const technicians = await prisma.technician.findMany({
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

    logger.info(`${prompt} Invocation of prisma.technician.findMany function successfully completed.`);
    logger.info(`${prompt} Returning array of ${technicians.length} enabled services to job types to the caller.`);
    return technicians.map(technician => {
      const allSkills = technician.skills.map(rel => rel.skill);
      const enabledSkills = allSkills.filter(skill => skill.enabled);
      return {
        ...technician,
        skills: allSkills,
        enabledSkills,
      };
    });
  }

  /**
   * Get technicians for dropdown (optimized query)
   */
  static async findForDropdown() {
    return prisma.technician.findMany({
      where: {
        enabled: true,
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        technicianName: true,
        enabled: true,
        image: {
          select: {
            url: true,
          },
        },
      },
    });
  }

  /**
   * Get technician by ID
   */
  static async findById(id: string): Promise<TechnicianToSkills | null> {
    const technician = await prisma.technician.findUnique({
      where: { id },
      include: {
        skills: {
          include: { skill: true },
        },
        image: true,
      },
    });

    if (!technician) return null;

    return {
      ...technician,
      skills: technician.skills.map(rel => rel.skill),
      status: technician.status as TechnicianToSkills["status"],
    };
  }

  /**
   * Update a technician
   */
  static async update(
    id: string,
    data: Partial<{
      technicianName: string;
      enabled: boolean;
      imageId: string | null;
    }>
  ) {
    const prompt = 'TechnicianRepository.update function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.technician.update with where: { id: ${id} }...`);
    const updatedTechnician = await prisma.technician.update({
      where: { id },
      data,
    });
    logger.info(`${prompt} Invocation of prisma.technician.update function successfully completed.`);
    logger.info(`${prompt} Technician updated with ID: ${updatedTechnician.id}.`);
    return updatedTechnician;
  }

  /**
   * Get technician with image for deletion
   */
  static async findByIdWithImageAndSkills(id: string) {
    return prisma.technician.findUnique({
      where: { id },
      include: { image: true, skills: true },
    });
  }

  /**
   * Delete image by ID
   */
  static async deleteImage(imageId: string) {
    return prisma.image.delete({
      where: { id: imageId },
    });
  }

  /**
   * Delete technician skill relations
   */
  static async deleteSkillRelations(technicianId: string) {
    return prisma.technicianSkill.deleteMany({
      where: { technicianId },
    });
  }

  /**
   * Delete technician
   */
  static async delete(id: string) {
    return prisma.technician.delete({
      where: { id },
    });
  }

  /**
   * Link a skill to a technician
   */
  static async linkSkill(technicianId: string, skillId: string) {
    const prompt = 'TechnicianRepository.linkSkill function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.technicianSkill.create...`);
    try {
      return await prisma.technicianSkill.create({
        data: {
          technicianId,
          skillId,
        },
      });
    } catch (error: unknown) {
      // If relation already exists, ignore the error
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        logger.info(`${prompt} Skill ${skillId} is already linked to technician ${technicianId}. Skipping.`);
        return null;
      }
      throw error;
    }
  }

  /**
   * Unlink a skill from a technician
   */
  static async unlinkSkill(technicianId: string, skillId: string) {
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

