"use server";

import { prisma } from "@/lib/prisma";
import { Booking } from "@/lib/types/booking";
import pino from "pino";

const logger = pino({ name: "bookings-actions" });

export type BookingData = {
  customerId: string;
  serviceId: string;
  technicianId: string;
  scheduledFor: string;
  status: string;
  notes: string;
};

export async function getAllBookings() {
  return prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function addBooking(bookingData: BookingData): Promise<Booking> {
  return prisma.booking.create({
    data: {
        customerId: bookingData.customerId,
        serviceId: bookingData.serviceId,
        technicianId: bookingData.technicianId,
        scheduledFor: bookingData.scheduledFor,
        status: bookingData.status,
        notes: bookingData.notes,
    },
  });
}

export async function updateBooking(bookingId: string, bookingData: BookingData): Promise<Booking> {
    return prisma.booking.update({
        where: { id: bookingId },
        data: {
            customerId: bookingData.customerId,
            serviceId: bookingData.serviceId,
            technicianId: bookingData.technicianId,
            scheduledFor: bookingData.scheduledFor,
            status: bookingData.status,
            notes: bookingData.notes,
        },
    });
}

export async function deleteBooking(bookingId: string): Promise<Booking> {
  return prisma.booking.delete({
    where: { id: bookingId },
  });
}   