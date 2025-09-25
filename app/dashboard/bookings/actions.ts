"use server";

import { prisma } from "@/lib/prisma";

export type BookingData = {
  customerId: string;
  jobId: string;
  serviceId: string;
  technicianId: string;
  scheduledFor: Date;
  status: string;
  revenue?: number;
  notes: string;
};

export async function getAllBookings() {
  return prisma.booking.findMany({
    orderBy: { scheduledFor: "desc" },
  });
}

// export async function addBooking(bookingData: BookingData) {  
//   return prisma.booking.create({
//     data: {
//         customerId: bookingData.customerId,
//         jobId: bookingData.jobId,
//         serviceId: bookingData.serviceId,
//         technicianId: bookingData.technicianId,
//         scheduledFor: new Date(bookingData.scheduledFor),
//         status: bookingData.status,
//         revenue: Number(bookingData.revenue),
//         notes: bookingData.notes,
//     },
//   });
// }

export async function updateBooking(bookingId: string, bookingData: BookingData) {
  return prisma.booking.update({
      where: { id: bookingId },
      data: {
          customerId: bookingData.customerId,
          jobId: bookingData.jobId,
          serviceId: bookingData.serviceId,
          technicianId: bookingData.technicianId,
          scheduledFor: bookingData.scheduledFor,
          status: bookingData.status,
          revenue: bookingData.revenue,
          notes: bookingData.notes,
      },
  });
}

export async function deleteBooking(bookingId: string) {
  return prisma.booking.delete({
    where: { id: bookingId },
  });
}   