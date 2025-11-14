/**
 * Server-side wrapper for ServiceRepository
 * This file re-exports repository methods as Server Actions
 * for use in client components
 */

"use server";

import { ServiceRepository } from "./ServiceRepository";

/**
 * Server Action: Get ENABLED services only
 * Can be called from client components
 */
export async function getEnabledServicesOnly() {
  return ServiceRepository.findEnabled();
}

/**
 * Server Action: Get all service
 * Can be called from client components
 */
export async function getAllServices() {
  return ServiceRepository.findAll();
}

/**
 * Server Action: Get service by ID
 * Can be called from client components
 */
export async function getServiceById(id: string) {
  return ServiceRepository.findById(id);
}

