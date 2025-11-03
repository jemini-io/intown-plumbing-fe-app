// Narrow relation shapes to exactly what is selected in queries

export type Booking = {
  id: string;
  customerId: string;
  jobId: string;
  scheduledFor: Date;
  status: string;
  revenue: number;
  notes: string;
  service: { displayName: string } | null;
  technician?: { technicianName: string } | null;
};
