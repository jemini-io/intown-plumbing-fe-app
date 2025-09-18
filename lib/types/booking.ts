export type Booking = {
  id: string;
  customerId: string;
  serviceId: string;
  technicianId: string;
  scheduledFor: Date;
  status: string;
  notes: string;
};
