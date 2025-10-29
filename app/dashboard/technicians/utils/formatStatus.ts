import { Status } from "@/lib/types/technicianToSkills";

export function formatStatus(status: Status) {
  if (!status) return "No status";
  switch (status) {
    case "ON JOB": return "On Job";
    case "ON ROUTE": return "On Route to Job";
    case "FINISHED JOB": return "Finished Job";
    case "AWAITING JOB": return "Awaiting Job";
    default: return String(status).replace(/_/g, " ");
  }
}