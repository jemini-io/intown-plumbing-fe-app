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
  skills: Skill[];
}