import { Skill } from "./skill";

export interface ServiceToJobType {
  id: string;
  displayName: string;
  serviceTitanId: number;
  serviceTitanName: string;
  emoji: string;
  icon: string;
  description: string;
  enabled: boolean;
  skills?: Skill[] | []; // Added to include related skills
  enabledSkills?: Skill[] | []; // Added to include only enabled related skills
}