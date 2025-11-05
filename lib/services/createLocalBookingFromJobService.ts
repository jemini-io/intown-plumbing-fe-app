import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/lib/types/booking";
import pino from "pino";

const logger = pino({ name: "create-local-booking-from-job-background-service" });

export async function createLocalBookingFromJob({
  customerId,
  jobId,
  serviceId,
  technicianId,
  scheduledFor,
  status,
  revenue,
  notes,
}: {
  customerId: string;
  jobId: string;
  serviceId: string;
  technicianId: string;
  scheduledFor: Date;
  status: string;
  revenue: number;
  notes: string;
}) {
  setImmediate(async () => {
    try {
      logger.info("Background task started for creating local booking from job");
      const booking = await prisma.booking.create({
            data: {
              customerId: customerId,
              jobId: jobId,
              serviceId: serviceId,
              technicianId: technicianId,
              scheduledFor: scheduledFor,
              status: status as BookingStatus,
              revenue: revenue,
              notes: notes,
            }
        });
      logger.info(booking, "Successfully created local booking from job (background)");
      
      return booking;
    } catch (err) {
      logger.error({ err }, "Error creating local booking from job:");
    }
  });
}