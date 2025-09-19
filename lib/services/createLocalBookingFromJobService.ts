import { prisma } from "@/lib/prisma";
import pino from "pino";

const logger = pino({ name: "create-local-booking-from-job-background-service" });

export async function createLocalBookingFromJob({
  customerId,
  serviceId,
  technicianId,
  scheduledFor,
  status,
  notes,
}: {
  customerId: string;
  serviceId: string;
  technicianId: string;
  scheduledFor: Date;
  status: string;
  notes: string;
}) {
  setImmediate(async () => {
    try {
      logger.info("Background task started for creating local booking from job");
      const booking = await prisma.booking.create({
            data: {
              customerId: customerId,
              serviceId: serviceId,
              technicianId: technicianId,
              scheduledFor: scheduledFor,
              status: status,
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