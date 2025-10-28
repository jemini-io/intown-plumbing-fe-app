import { ServiceToJobType } from "./serviceToJobType";
import { TechnicianToSkills } from "./technicianToSkills";

export interface Skill {
  id: string;
  name: string;
  description?: string | null;
  enabled: boolean;
  serviceToJobTypes?: ServiceToJobType[];
  technicians?: TechnicianToSkills[];
}