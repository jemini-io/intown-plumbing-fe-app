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