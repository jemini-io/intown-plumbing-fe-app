/**
 * Server-side wrapper for BookingRepository
 * This file re-exports repository methods as Server Actions
 * for use in client components
 */

"use server";

import { BookingRepository } from "./BookingRepository";

/**
 * Server Action: Get all bookings
 * Can be called from client components
 */
export async function getAllBookings() {
  return BookingRepository.findAll();
}

/**
 * Server Action: Get booking by ID
 * Can be called from client components
 */
export async function getBookingById(id: string) {
  return BookingRepository.findById(id);
}

/**
 * Server Action: Calculate total revenue
 * Can be called from client components
 */
export async function getTotalRevenue() {
  return BookingRepository.totalRevenue();
}

