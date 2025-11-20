/**
 * Repository for Booking entity
 * Encapsulates all database access for Booking
 */

import { prisma } from "@/lib/prisma";
import { Booking, BookingStatus } from "@/lib/types/booking";
import pino from "pino";

const logger = pino({ name: "BookingRepository" });

export type BookingData = {
  customerId: string;
  jobId: string;
  serviceId: string;
  technicianId: string;
  scheduledFor: Date;
  status: BookingStatus;
  revenue?: number;
  notes: string;
};

export class BookingRepository {
  /**
   * Get all bookings
   */
  static async findAll(): Promise<Booking[]> {
    const prompt = 'BookingRepository.findAll function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.booking.findMany function...`);
    const bookings = await prisma.booking.findMany({
      orderBy: { scheduledFor: "desc" },
      include: {
        service: true,
        technician: true,
        customer: {
          include: {
            emailAddress: true,
            phoneNumber: true,
            image: true,
            bookings: true,
          },
        },
      },
    });

    logger.info(`${prompt} Invocation of prisma.booking.findMany function successfully completed.`);
    logger.info(`${prompt} Returning array of ${bookings.length} bookings to the caller.`);
    return bookings.map(booking => ({
      ...booking,
      customer: booking.customer ? {
        ...booking.customer,
        emailAddress: booking.customer.emailAddress,
        phoneNumber: booking.customer.phoneNumber,
        bookings: booking.customer.bookings || [],
      } : null,
      service: booking.service || null,
      technician: booking.technician || null,
    }));
  }

  /**
   * Get booking by ID
   */
  static async findById(id: string): Promise<Booking | null> {
    const prompt = 'BookingRepository.findById function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.booking.findUnique function with ID: ${id}...`);
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        technician: true,
        customer: {
          include: {
            emailAddress: true,
            phoneNumber: true,
            image: true,
            bookings: true,
          },
        },
      },
    });

    logger.info(`${prompt} Invocation of prisma.booking.findUnique function successfully completed.`);
    if (!booking) {
      logger.info(`${prompt} No booking found with ID: ${id}. Returning null to the caller.`);
      return null;
    }

    logger.info(`${prompt} Booking found with ID: ${booking.id}.`);
    logger.info(`${prompt} Returning the booking with ID: ${booking.id} to the caller.`);
    return {
      ...booking,
      customer: booking.customer ? {
        ...booking.customer,
        emailAddress: booking.customer.emailAddress,
        phoneNumber: booking.customer.phoneNumber,
        bookings: booking.customer.bookings || [],
      } : null,
      service: booking.service || null,
      technician: booking.technician || null,
    };
  }

  /**
   * Create a new booking
   */
  static async create(data: BookingData): Promise<Booking> {
    const prompt = 'BookingRepository.create function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.booking.create function...`);
    const booking = await prisma.booking.create({
      data: {
        customerId: data.customerId,
        jobId: data.jobId,
        serviceId: data.serviceId,
        technicianId: data.technicianId,
        scheduledFor: new Date(data.scheduledFor),
        status: data.status as BookingStatus,
        revenue: data.revenue ?? 0,
        notes: data.notes,
      },
      include: {
        service: true,
        technician: true,
        customer: {
          include: {
            emailAddress: true,
            phoneNumber: true,
            image: true,
            bookings: true,
          },
        },
      },
    });

    logger.info(`${prompt} Invocation of prisma.booking.create function successfully completed.`);
    logger.info(`${prompt} Booking created with ID: ${booking.id}`);
    logger.info(`${prompt} Returning the created booking with ID: ${booking.id} to the caller.`);
    return {
      ...booking,
      customer: booking.customer ? {
        ...booking.customer,
        emailAddress: booking.customer.emailAddress,
        phoneNumber: booking.customer.phoneNumber,
        bookings: booking.customer.bookings || [],
      } : null,
      service: booking.service || null,
      technician: booking.technician || null,
    };
  }

  /**
   * Update a booking
   */
  static async update(id: string, data: BookingData): Promise<Booking> {
    const prompt = 'BookingRepository.update function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.booking.update function with ID: ${id}...`);
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        customerId: data.customerId,
        jobId: data.jobId,
        serviceId: data.serviceId,
        technicianId: data.technicianId,
        scheduledFor: data.scheduledFor,
        status: data.status as BookingStatus,
        revenue: data.revenue,
        notes: data.notes,
      },
      include: {
        service: true,
        technician: true,
        customer: {
          include: {
            emailAddress: true,
            phoneNumber: true,
            image: true,
            bookings: true,
          },
        },
      },
    });

    logger.info(`${prompt} Invocation of prisma.booking.update function successfully completed.`);
    logger.info(`${prompt} Booking updated with ID: ${booking.id}`);
    logger.info(`${prompt} Returning the updated booking with ID: ${booking.id} to the caller.`);
    return {
      ...booking,
      customer: booking.customer ? {
        ...booking.customer,
        emailAddress: booking.customer.emailAddress,
        phoneNumber: booking.customer.phoneNumber,
        bookings: booking.customer.bookings || [],
      } : null,
      service: booking.service || null,
      technician: booking.technician || null,
    };
  }

  /**
   * Delete a booking
   */
  static async delete(id: string): Promise<Booking> {
    const prompt = 'BookingRepository.delete function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.booking.delete function with ID: ${id}...`);
    const deletedBooking = await prisma.booking.delete({
      where: { id },
    });
    logger.info(`${prompt} Invocation of prisma.booking.delete function successfully completed.`);
    logger.info(`${prompt} Booking deleted with ID: ${deletedBooking.id}`);
    logger.info(`${prompt} Returning the deleted booking with ID: ${deletedBooking.id} to the caller.`);
    return deletedBooking;
  }

  /**
   * Calculate total revenue from all bookings
   */
  static async totalRevenue(): Promise<number> {
    const prompt = 'BookingRepository.totalRevenue function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.booking.aggregate function...`);
    const result = await prisma.booking.aggregate({
      _sum: {
        revenue: true,
      },
    });
    const total = result._sum.revenue ?? 0;
    logger.info(`${prompt} Invocation of prisma.booking.aggregate function successfully completed.`);
    logger.info(`${prompt} Total revenue: ${total}`);
    logger.info(`${prompt} Returning total revenue: ${total} to the caller.`);
    return total;
  }
}

