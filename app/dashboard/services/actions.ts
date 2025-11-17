"use server";

import { ServiceToJobType } from "@/lib/types/serviceToJobType";
import { ServiceRepository } from "@/lib/repositories";
import pino from "pino";

const logger = pino({ name: "services-actions" });

/**
 * Server Actions for ServiceToJobType
 * These actions use the Repository pattern for database access
 * and add logging/validation/business logic as needed
 */

export async function getAllServices() {
  const prompt = 'getAllServices function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking ServiceRepository.findAll function...`);
  const services = await ServiceRepository.findAll();
  logger.info(`${prompt} Invocation of ServiceRepository.findAll function successfully completed.`);
  logger.info(`${prompt} Returning array of ${services.length} services to job types to the caller.`);
  return services;
}

export async function getEnabledServicesOnly() {
  const prompt = 'getEnabledServicesOnly function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking ServiceRepository.findEnabled function...`);
  const services = await ServiceRepository.findEnabled();
  logger.info(`${prompt} Invocation of ServiceRepository.findEnabled function successfully completed.`);
  logger.info(`${prompt} Returning array of ${services.length} enabled services to job types to the caller.`);
  return services;
}

// Optimized function for dropdowns - only fetches id, displayName, and enabled
export async function getServicesForDropdown() {
  const prompt = "getServicesForDropdown function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking ServiceRepository.findForDropdown function...`);
  const services = await ServiceRepository.findForDropdown();
  logger.info(`${prompt} Invocation of ServiceRepository.findForDropdown function successfully completed.`);
  logger.info(`${prompt} Returning array of ${services.length} services for dropdown to the caller.`);
  return services;
}

export async function findServiceById(id: string) {
  const prompt = "findServiceById function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking ServiceRepository.findById function with ID: ${id}`);
  const service = await ServiceRepository.findById(id);
  logger.info(`${prompt} Invocation of ServiceRepository.findById function successfully completed.`);
  logger.info(`${prompt} Service found with ID: ${service?.id}`);
  logger.info(`${prompt} Returning the service with ID: ${service?.id} to the caller.`);
  return service;
}

export async function addService(
  data: Omit<ServiceToJobType, "id" | "skills"> & { skillIds?: string[] }
) {
  const prompt = "addService function says:";
  logger.info(`${prompt} Starting...`);
  logger.info({ data }, `${prompt} Invoking ServiceRepository.create function with data:`);
  const createdService = await ServiceRepository.create(data);
  logger.info(`${prompt} Invocation of ServiceRepository.create function successfully completed.`);
  logger.info(`${prompt} Service created with ID: ${createdService.id}`);
  logger.info(`${prompt} Returning the created service with ID: ${createdService.id} to the caller.`);
  return createdService;
}

export async function updateService(
  id: string,
  data: Partial<Omit<ServiceToJobType, "skills">> & { skillIds?: string[] }
) {
  const prompt = "updateService function says:";
  logger.info(`${prompt} Starting...`);
  logger.info({ data }, `${prompt} Invoking ServiceRepository.update function with data:`);
  const updatedService = await ServiceRepository.update(id, data);
  logger.info(`${prompt} Invocation of ServiceRepository.update function successfully completed.`);
  logger.info(`${prompt} Service updated with ID: ${updatedService.id}`);
  logger.info(`${prompt} Returning the updated service with ID: ${updatedService.id} to the caller.`);
  return ServiceRepository.update(id, data);
}

export async function deleteService(id: string) {
  const prompt = "deleteService function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking ServiceRepository.delete function with ID: ${id}`);
  const deletedService = await ServiceRepository.delete(id);
  logger.info(`${prompt} Invocation of ServiceRepository.delete function successfully completed.`);
  logger.info(`${prompt} Service deleted with ID: ${id}`);
  logger.info(`${prompt} Returning the deleted service with ID: ${id} to the caller.`);
  return deletedService;
}

export async function unlinkSkillFromService(serviceId: string, skillId: string) {
  const prompt = 'unlinkSkillFromService function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Returning invocation of ServiceRepository.unlinkSkill function to the caller.`);
  return ServiceRepository.unlinkSkill(serviceId, skillId);
}

