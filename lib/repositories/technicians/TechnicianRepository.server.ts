/**
 * Server-side wrapper for TechnicianRepository
 * This file re-exports repository methods as Server Actions
 * for use in client components
 */

"use server";

import { TechnicianRepository } from "./TechnicianRepository";

/**
 * Server Action: Get all enabled technicians to job types
 * Can be called from client components
 */
export async function getEnabledTechniciansOnly() {
    return TechnicianRepository.findEnabled();
  }

/**
 * Server Action: Get all technicians
 * Can be called from client components
 */
export async function getAllTechnicians() {
  return TechnicianRepository.findAll();
}

/**
 * Server Action: Get technicians for dropdown
 * Can be called from client components
 */
export async function getTechniciansForDropdown() {
  return TechnicianRepository.findForDropdown();
}

/**
 * Server Action: Get technician by ID
 * Can be called from client components
 */
export async function getTechnicianById(id: string) {
  return TechnicianRepository.findById(id);
}

