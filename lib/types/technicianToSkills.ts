import { Skill } from "./skill";

export interface TechnicianToSkills {
  id: string;
  technicianId: number;
  technicianName: string;
  enabled: boolean;
  skills: Skill[];
}