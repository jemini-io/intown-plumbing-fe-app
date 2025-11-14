/**
 * Repository for ServiceToJobType entity
 * Encapsulates all database access for ServiceToJobType
 * Similar to ActiveRecord models in Rails
 */

import { prisma } from "@/lib/prisma";
import { ServiceToJobType } from "@/lib/types/serviceToJobType";
import pino from "pino";

const logger = pino({ name: "ServiceRepository" });

export class ServiceRepository {
  /**
   * Get all service to job types
   */
  static async findAll(): Promise<ServiceToJobType[]> {
    const prompt = 'ServiceRepository.findAll function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.serviceToJobType.findMany function...`);
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

    logger.info(`${prompt} Invocation of prisma.serviceToJobType.findMany function successfully completed.`);
    logger.info(`${prompt} Returning array of ${services.length} services to job types to the caller.`);
    return services.map(service => ({
      ...service,
      skills: service.skills.map(rel => rel.skill),
    }));
  }

  /**
   * Get all enabled service to job types
   */
  static async findEnabled(): Promise<ServiceToJobType[]> {
    const prompt = 'ServiceRepository.findEnabled function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.serviceToJobType.findMany function with "where: { enabled: true }"...`);
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

    logger.info(`${prompt} Invocation of prisma.serviceToJobType.findMany function successfully completed.`);
    logger.info(`${prompt} Returning array of ${services.length} enabled services to job types to the caller.`);
    return services.map(service => {
      const allSkills = service.skills.map(rel => rel.skill);
      const enabledSkills = allSkills.filter(skill => skill.enabled);
      return {
        ...service,
        skills: allSkills,
        enabledSkills,
      };
    });
  }

  /**
   * Get service to job type by ID
   */
  static async findById(id: string): Promise<ServiceToJobType | null> {
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

  /**
   * Get services for dropdown (optimized query)
   */
  static async findForDropdown() {
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

  /**
   * Create a new service to job type
   */
  static async create(
    data: Omit<ServiceToJobType, "id" | "skills"> & { skillIds?: string[] }
  ) {
    const { skillIds, ...serviceData } = data;
    const createdService = await prisma.serviceToJobType.create({
      data: serviceData,
    });

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

  /**
   * Update a service to job type
   */
  static async update(
    id: string,
    data: Partial<Omit<ServiceToJobType, "skills">> & { skillIds?: string[] }
  ) {
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

  /**
   * Delete a service to job type
   */
  static async delete(id: string) {
    // Delete associations first
    await prisma.serviceToJobTypeSkill.deleteMany({
      where: { serviceToJobTypeId: id },
    });
    // Delete the service
    return prisma.serviceToJobType.delete({
      where: { id },
    });
  }

  /**
   * Unlink a skill from a service
   */
  static async unlinkSkill(serviceId: string, skillId: string) {
    const prompt = 'ServiceRepository.unlinkSkill function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Returning the invocation of prisma.serviceToJobTypeSkill.delete function to the caller.`);
    return prisma.serviceToJobTypeSkill.delete({
      where: {
        serviceToJobTypeId_skillId: {
          serviceToJobTypeId: serviceId,
          skillId: skillId,
        },
      },
    });
  }
}

