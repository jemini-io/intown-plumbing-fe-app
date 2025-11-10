// Narrow relation shapes to exactly what is selected in queries

import { Customer } from "./customer";
import { ServiceToJobType } from "./serviceToJobType";
import { TechnicianToSkills } from "./technicianToSkills";

export type BookingStatus = "PENDING" | "SCHEDULED" | "CANCELED" | "COMPLETED";

export interface Booking {
  id: string;
  customerId: string;
  jobId: string;
  serviceId: string;
  technicianId: string;
  scheduledFor: Date;
  status: BookingStatus;
  revenue: number;
  notes: string;
  customer?: Customer | null;
  service?: ServiceToJobType | null;
  technician?: TechnicianToSkills | null;
}
