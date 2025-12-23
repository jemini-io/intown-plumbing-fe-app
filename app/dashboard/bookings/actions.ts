"use server";

import { BookingRepository, BookingData } from "@/lib/repositories/bookings/BookingRepository";
import pino from "pino";

const logger = pino({ name: "bookings-actions" });

/**
 * Server Actions for Booking
 * These actions use the Repository pattern for database access
 * and add logging/validation/business logic as needed
 */

// Re-export BookingData type for backward compatibility
export type { BookingData };

export async function getAllBookings() {
  const prompt = "getAllBookings function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking BookingRepository.findAll function...`);
  const bookings = await BookingRepository.findAll();
  logger.info(`${prompt} Invocation of BookingRepository.findAll function successfully completed.`);
  logger.info(`${prompt} Returning array of ${bookings.length} bookings to the caller.`);
  return bookings;
}

export async function addBooking(bookingData: BookingData) {
  const prompt = "addBooking function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking BookingRepository.create function...`);
  const booking = await BookingRepository.create(bookingData);
  logger.info(`${prompt} Invocation of BookingRepository.create function successfully completed.`);
  logger.info(`${prompt} Booking created with ID: ${booking.id}`);
  logger.info(`${prompt} Returning the created booking with ID: ${booking.id} to the caller.`);
  return booking;
}

export async function updateBooking(bookingId: string, bookingData: BookingData) {
  const prompt = "updateBooking function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking BookingRepository.update function with ID: ${bookingId}...`);
  const booking = await BookingRepository.update(bookingId, bookingData);
  logger.info(`${prompt} Invocation of BookingRepository.update function successfully completed.`);
  logger.info(`${prompt} Booking updated with ID: ${booking.id}`);
  logger.info(`${prompt} Returning the updated booking with ID: ${booking.id} to the caller.`);
  return booking;
}

export async function deleteBooking(bookingId: string) {
  const prompt = "deleteBooking function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking BookingRepository.delete function with ID: ${bookingId}...`);
  const deletedBooking = await BookingRepository.delete(bookingId);
  logger.info(`${prompt} Invocation of BookingRepository.delete function successfully completed.`);
  logger.info(`${prompt} Booking deleted with ID: ${deletedBooking.id}`);
  logger.info(`${prompt} Returning the deleted booking with ID: ${deletedBooking.id} to the caller.`);
  return deletedBooking;
}

export async function totalRevenue(): Promise<number> {
  const prompt = "totalRevenue function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking BookingRepository.totalRevenue function...`);
  const revenue = await BookingRepository.totalRevenue();
  logger.info(`${prompt} Invocation of BookingRepository.totalRevenue function successfully completed.`);
  logger.info(`${prompt} Total revenue: ${revenue}`);
  logger.info(`${prompt} Returning total revenue: ${revenue} to the caller.`);
  return revenue;
}