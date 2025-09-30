export type Booking = {
  id: string;
  customerId: string;
  jobId: string;
  serviceId: string;
  technicianId: string;
  scheduledFor: Date;
  status: string;
  revenue: number;
  notes: string;
};
