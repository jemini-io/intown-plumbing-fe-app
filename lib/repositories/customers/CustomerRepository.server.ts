/**
 * Server-side wrapper for CustomerRepository
 * This file re-exports repository methods as Server Actions
 * for use in client components
 */

"use server";

import { CustomerRepository } from "./CustomerRepository";

/**
 * Server Action: Get all customers
 * Can be called from client components
 */
export async function getAllCustomers() {
  return CustomerRepository.findAll();
}

/**
 * Server Action: Get customers for dropdown
 * Can be called from client components
 */
export async function getCustomersForDropdown() {
  return CustomerRepository.findForDropdown();
}

/**
 * Server Action: Get customer by ID
 * Can be called from client components
 */
export async function getCustomerById(id: string) {
  return CustomerRepository.findById(id);
}

