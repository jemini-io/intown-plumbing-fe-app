/**
 * Server-side wrapper for ServiceToJobTypeRepository
 * This file re-exports repository methods as Server Actions
 * for use in client components
 */

"use server";

import { ServiceRepository } from "./ServiceRepository";

/**
 * Server Action: Get all enabled service to job types
 * Can be called from client components
 */
export async function getEnabledServicesOnly() {
  return ServiceRepository.findEnabled();
}

/**
 * Server Action: Get all service to job types
 * Can be called from client components
 */
export async function getAllServices() {
  return ServiceRepository.findAll();
}

/**
 * Server Action: Get service to job type by ID
 * Can be called from client components
 */
export async function getServiceById(id: string) {
  return ServiceRepository.findById(id);
}

