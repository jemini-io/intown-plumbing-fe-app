/**
 * Server-side wrapper for SkillRepository
 * This file re-exports repository methods as Server Actions
 * for use in client components
 */

"use server";

import { SkillRepository } from "./SkillRepository";

/**
 * Server Action: Get all skills
 * Can be called from client components
 */
export async function getAllSkills() {
  return SkillRepository.findAll();
}

/**
 * Server Action: Get skill by ID
 * Can be called from client components
 */
export async function getSkillById(id: string) {
  return SkillRepository.findById(id);
}

