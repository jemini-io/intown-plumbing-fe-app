"use server";

import { Skill } from "@/lib/types/skill";
import { SkillRepository } from "@/lib/repositories";
import pino from "pino";

const logger = pino({ name: "skills-actions" });

/**
 * Server Actions for Skill
 * These actions use the Repository pattern for database access
 * and add logging/validation/business logic as needed
 */

export async function getAllSkills() {
  const prompt = 'getAllSkills function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking SkillRepository.findAll function...`);
  const skills = await SkillRepository.findAll();
  logger.info(`${prompt} Invocation of SkillRepository.findAll function successfully completed.`);
  logger.info(`${prompt} Returning array of ${skills.length} skills to the caller.`);
  return skills;
}

export async function findSkillById(id: string) {
  const prompt = "findSkillById function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking SkillRepository.findById function with ID: ${id}`);
  const skill = await SkillRepository.findById(id);
  logger.info(`${prompt} Invocation of SkillRepository.findById function successfully completed.`);
  logger.info(`${prompt} Skill found with ID: ${skill?.id}`);
  logger.info(`${prompt} Returning the skill with ID: ${skill?.id} to the caller.`);
  return skill;
}

export async function addSkill(
  data: Omit<Skill, "id" | "serviceToJobTypes" | "technicians"> & {
    serviceIds?: string[];
    technicianIds?: string[];
  }
) {
  const prompt = "addSkill function says:";
  logger.info(`${prompt} Starting...`);
  logger.info({ data }, `${prompt} Invoking SkillRepository.create function with data:`);
  const createdSkill = await SkillRepository.create(data);
  logger.info(`${prompt} Invocation of SkillRepository.create function successfully completed.`);
  logger.info(`${prompt} Skill created with ID: ${createdSkill.id}`);
  logger.info(`${prompt} Returning the created skill with ID: ${createdSkill.id} to the caller.`);
  return createdSkill;
}

export async function updateSkill(
  id: string,
  data: Partial<Omit<Skill, "serviceToJobTypes" | "technicians">> & {
    serviceIds?: string[];
    technicianIds?: string[];
  }
) {
  const prompt = "updateSkill function says:";
  logger.info(`${prompt} Starting...`);
  logger.info({ data }, `${prompt} Invoking SkillRepository.update function with data:`);
  const updatedSkill = await SkillRepository.update(id, data);
  logger.info(`${prompt} Invocation of SkillRepository.update function successfully completed.`);
  logger.info(`${prompt} Skill updated with ID: ${updatedSkill.id}`);
  logger.info(`${prompt} Returning the updated skill with ID: ${updatedSkill.id} to the caller.`);
  return updatedSkill;
}

export async function deleteSkill(id: string) {
  const prompt = "deleteSkill function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking SkillRepository.deleteServiceRelations function...`);
  await SkillRepository.deleteServiceRelations(id);
  logger.info(`${prompt} Invocation of SkillRepository.deleteServiceRelations function successfully completed.`);
  logger.info(`${prompt} Invoking SkillRepository.deleteTechnicianRelations function...`);
  await SkillRepository.deleteTechnicianRelations(id);
  logger.info(`${prompt} Invocation of SkillRepository.deleteTechnicianRelations function successfully completed.`);
  logger.info(`${prompt} Invoking SkillRepository.delete function...`);
  const deletedSkill = await SkillRepository.delete(id);
  logger.info(`${prompt} Invocation of SkillRepository.delete function successfully completed.`);
  logger.info(`${prompt} Skill with ID: ${deletedSkill.id} successfully deleted.`);
  logger.info(`${prompt} Returning the deleted skill with ID: ${deletedSkill.id} to the caller.`);
  return deletedSkill;
}

export async function unlinkServiceFromSkill(skillId: string, serviceId: string) {
  const prompt = "unlinkServiceFromSkill function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking SkillRepository.unlinkService function...`);
  await SkillRepository.unlinkService(skillId, serviceId);
  logger.info(`${prompt} Invocation of SkillRepository.unlinkService function successfully completed.`);
  logger.info(`${prompt} Service ${serviceId} unlinked from skill ${skillId}.`);
}

export async function unlinkTechnicianFromSkill(skillId: string, technicianId: string) {
  const prompt = "unlinkTechnicianFromSkill function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking SkillRepository.unlinkTechnician function...`);
  await SkillRepository.unlinkTechnician(skillId, technicianId);
  logger.info(`${prompt} Invocation of SkillRepository.unlinkTechnician function successfully completed.`);
  logger.info(`${prompt} Technician ${technicianId} unlinked from skill ${skillId}.`);
}

