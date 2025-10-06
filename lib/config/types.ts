export interface ServiceToJobTypeMapping {
  id: number;
  displayName: string;
  serviceTitanId: number;
  serviceTitanName: string;
  emoji?: string;
  icon?: string; // New field for icon path
  description: string; // Added description field
  skills?: typeof QUOTE_SKILLS;
  enabled: boolean; // New field to indicate if the job type is enabled
}

export const QUOTE_SKILLS = [
  "Virtual Quote - Remodel Project",
  "Virtual Quote - Repair/Install",
  "Virtual Quote - Water Filtration"
] as const;

export type QuoteSkill = typeof QUOTE_SKILLS[number];

/**
 * Service Titan doesn't return the skills for technicians.
 * We need to map the technician ids to the skills they have.
 */
export type SUPPORTED_SKILLS = 
  | "Virtual Quote - Remodel Project"
  | "Virtual Quote - Repair/Install"
  | "Virtual Quote - Water Filtration"
  | "Virtual Service";

export interface TechnicianToSkillsMapping {
  technicianId: number;
  technicianName: string;
  skills: SUPPORTED_SKILLS[];
  enabled: boolean;
}