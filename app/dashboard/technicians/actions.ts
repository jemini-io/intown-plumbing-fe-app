"use server";

import { TechnicianRepository } from "@/lib/repositories/TechnicianRepository";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import pino from "pino";

const logger = pino({ name: "technicians-actions" });

/**
 * Server Actions for Technician
 * These actions use the Repository pattern for database access
 * and add logging/validation/business logic as needed
 */

export async function getAllTechnicians() {
  try {
    const prompt = "getAllTechnicians function says:";  
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking TechnicianRepository.findAll function...`);
    const technicians = await TechnicianRepository.findAll();
    logger.info(`${prompt} Invocation of TechnicianRepository.findAll function successfully completed.`);
    logger.info(`${prompt} Returning array of ${technicians.length} technicians to the caller.`);
    return technicians;
  } catch (error) {
    logger.error({ error }, `${prompt} Error running getAllTechnicians function:`);
    throw error;
  }
}

// Optimized function for dropdowns - only fetches id, technicianName, and enabled
export async function getTechniciansForDropdown() {
  const prompt = "getTechniciansForDropdown function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking TechnicianRepository.findForDropdown function...`);
  const technicians = await TechnicianRepository.findForDropdown();
  logger.info(`${prompt} Invocation of TechnicianRepository.findForDropdown function successfully completed.`);
  logger.info(`${prompt} Returning array of ${technicians.length} technicians for dropdown to the caller.`);
  return technicians;
}

export async function findTechnicianById(id: string) {
  const prompt = "findTechnicianById function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking TechnicianRepository.findById function with ID: ${id}`);
  const technician = await TechnicianRepository.findById(id);
  logger.info(`${prompt} Invocation of TechnicianRepository.findById function successfully completed.`);
  logger.info(`${prompt} Technician found with ID: ${technician?.id}`);
  logger.info(`${prompt} Returning the technician with ID: ${technician?.id} to the caller.`);
  return technician;
}

export async function deleteTechnician(id: string) {
  const prompt = "deleteTechnician function says:";
  logger.info(`${prompt} Starting...`);

  logger.info(`${prompt} Invoking TechnicianRepository.findByIdWithImage function with ID: ${id}...`);
  const technician = await TechnicianRepository.findByIdWithImageAndSkills(id);

  if (!technician) {
    logger.warn(`${prompt} Technician with ID: ${id} not found. Skipping delete.`);
    return;
  }

  // Delete image from Cloudinary if it exists (business logic)
  if (technician.image?.publicId) {
    logger.info(`${prompt} Technician has associated an image with publicID: ${technician.image.publicId}. Proceeding with deletion...`);
    logger.info(`${prompt} Invoking deleteFromCloudinary function with public ID: ${technician.image.publicId}...`);
    await deleteFromCloudinary(technician.image.publicId);
    logger.info(`${prompt} Invocation of deleteFromCloudinary function successfully completed.`);
  }

  // Delete associated Image entry if it exists
  if (technician.image?.id) {
    logger.info(`${prompt} Technician has associated an image in Image table with ID: ${technician.image.id}. Proceeding with deletion...`);
    logger.info(`${prompt} Invoking TechnicianRepository.deleteImage function with ID: ${technician.image.id}...`);
    await TechnicianRepository.deleteImage(technician.image.id);
    logger.info(`${prompt} Invocation of TechnicianRepository.deleteImage function successfully completed.`);
  }

  // Delete TechnicianSkill relations if any
  if (technician.skills.length > 0) {
    logger.info(`${prompt} Technician has ${technician.skills.length} associated skills. Proceeding with deletion of skill relations...`);
    logger.info(`${prompt} Invoking TechnicianRepository.deleteSkillRelations function...`);
    await TechnicianRepository.deleteSkillRelations(id);
    logger.info(`${prompt} Invocation of TechnicianRepository.deleteSkillRelations function successfully completed.`);
  }
  
  // Delete the technician itself
  logger.info(`${prompt} Proceeding with deletion of the technician itself...`);
  logger.info(`${prompt} Invoking TechnicianRepository.delete function with technician ID: ${id}...`);
  const deletedTechnician = await TechnicianRepository.delete(id);
  logger.info(`${prompt} Invocation of TechnicianRepository.delete function successfully completed.`);
  logger.info(`${prompt} Technician with ID: ${deletedTechnician.id} successfully deleted.`);
  logger.info(`${prompt} Returning the deleted technician with ID: ${deletedTechnician.id} to the caller.`);
  return deletedTechnician;
}

export async function unlinkSkillFromTechnician(technicianId: string, skillId: string) {
  const prompt = "unlinkSkillFromTechnician function says:";
  logger.info(`${prompt} Starting...`);
  try {  
    logger.info(`${prompt} Invoking TechnicianRepository.unlinkSkill function...`);
    await TechnicianRepository.unlinkSkill(technicianId, skillId);
    logger.info(`${prompt} Skill ${skillId} unlinked from technician ${technicianId}.`);
  } catch (error) {
    logger.error({ error }, `${prompt} Error running unlinkSkillFromTechnician function:`);
    throw error;
  }
}
