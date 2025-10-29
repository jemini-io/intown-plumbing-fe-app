import { Skill } from "./skill";
import { UserImage } from "@/app/dashboard/users/types";

export type Status = "ON JOB" | "ON ROUTE" | "FINISHED JOB" | "AWAITING JOB";

export function statusToEnum(status: Status | string): string {
  switch (status) {
    case "ON JOB": return "ON_JOB";
    case "ON ROUTE": return "ON_ROUTE";
    case "FINISHED JOB": return "FINISHED_JOB";
    case "AWAITING JOB": return "AWAITING_JOB";
    default: return "AWAITING_JOB";
  }
}

export function enumToStatus(enumValue: string): Status {
  switch (enumValue) {
    case "ON_JOB": return "ON JOB";
    case "ON_ROUTE": return "ON ROUTE";
    case "FINISHED_JOB": return "FINISHED JOB";
    case "AWAITING_JOB": return "AWAITING JOB";
    default: return "AWAITING JOB";
  }
}

export interface TechnicianToSkills {
  id: string;
  technicianId: number;
  technicianName: string;
  enabled: boolean;
  skills: Skill[];
  status: Status;
  image: UserImage | null;
}