"use server";

import pino from "pino";
import { CustomerType } from "@/lib/types/customer";
import { CustomerRepository } from "@/lib/repositories";
import { findEmailAddressById, findEmailAddressByAddress, addEmailAddress } from "@/app/dashboard/emailAddresses/actions";
import { findPhoneNumberById, findPhoneNumberByCountryCodeAndNumber, addPhoneNumber } from "@/app/dashboard/phoneNumbers/actions";

const logger = pino({ name: "customers-actions" });

/**
 * Server Actions for Customer
 * These actions use the Repository pattern for database access
 * and add logging/validation/business logic as needed
 */

export async function getAllCustomers() {
  const prompt = 'getAllCustomers function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking CustomerRepository.findAll function...`);
  const customers = await CustomerRepository.findAll();
  logger.info(`${prompt} Invocation of CustomerRepository.findAll function successfully completed.`);
  logger.info(`${prompt} Returning array of ${customers.length} customers to the caller.`);
  return customers;
}

// Optimized function for dropdowns - only fetches id and name
export async function getCustomersForDropdown() {
  const prompt = "getCustomersForDropdown function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking CustomerRepository.findForDropdown function...`);
  const customers = await CustomerRepository.findForDropdown();
  logger.info(`${prompt} Invocation of CustomerRepository.findForDropdown function successfully completed.`);
  logger.info(`${prompt} Returning array of ${customers.length} customers for dropdown to the caller.`);
  return customers;
}

export async function findCustomerById(id: string) {
  const prompt = 'findCustomerById function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking CustomerRepository.findById function with ID: ${id}...`);
  const customer = await CustomerRepository.findById(id);
  if (!customer) {
    logger.warn(`${prompt} Customer with ID ${id} not found`);
  } else {
    logger.info(`${prompt} Customer with ID ${id} found!`);
  }
  logger.info(`${prompt} Invocation of CustomerRepository.findById function successfully completed.`);
  logger.info(`${prompt} Returning customer: ${customer?.id} to the caller...`);
  return customer;
}

export async function findCustomerByServiceTitanId(customerId: number) {
  const prompt = "findCustomerByServiceTitanId function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking CustomerRepository.findByServiceTitanId function with ServiceTitan ID: ${customerId}...`);
  const customer = await CustomerRepository.findByServiceTitanId(customerId);
  logger.info(`${prompt} Invocation of CustomerRepository.findByServiceTitanId function successfully completed.`);
  logger.info(`${prompt} Customer found with ServiceTitan ID: ${customer?.customerId}`);
  logger.info(`${prompt} Returning customer: ${customer?.id} to the caller...`);
  return customer;
}

export async function addCustomer(data: {
  customerId: number;
  name: string;
  type?: CustomerType;
  emailAddress?: {
    Id?: string | null;
    address?: string;
  };
  phoneNumber?: {
    Id?: string | null;
    countryCode?: string;
    number?: string;
  };
  imageId?: string | null;
}) {
  logger.info(`Creating customer: ${data.name} (ServiceTitan ID: ${data.customerId})`);
  try {
    // Handle emailAddress: prioritize Id, then address
    let emailAddressId: string | null = null;
    if (data.emailAddress) {
      if (data.emailAddress.Id) {
        // Verify that the email address exists
        const existing = await findEmailAddressById(data.emailAddress.Id);
        if (!existing) {
          throw new Error(`EmailAddress with ID ${data.emailAddress.Id} not found`);
        }
        emailAddressId = existing.id;
      } else if (data.emailAddress.address) {
        // Find or create email address
        const emailAddress = await findEmailAddressByAddress(data.emailAddress.address);
        if (!emailAddress) {
          const newEmailAddress = await addEmailAddress({ address: data.emailAddress.address });
          emailAddressId = newEmailAddress.id;
        } else {
          emailAddressId = emailAddress.id;
        }
      }
    }

    // Handle phoneNumber: prioritize Id, then countryCode + number
    let phoneNumberId: string | null = null;
    if (data.phoneNumber) {
      if (data.phoneNumber.Id) {
        // Verify that the phone number exists
        const existing = await findPhoneNumberById(data.phoneNumber.Id);
        if (!existing) {
          throw new Error(`PhoneNumber with ID ${data.phoneNumber.Id} not found`);
        }
        phoneNumberId = existing.id;
      } else if (data.phoneNumber.countryCode && data.phoneNumber.number) {
        // Find or create phone number
        const phoneNumber = await findPhoneNumberByCountryCodeAndNumber(
          data.phoneNumber.countryCode,
          data.phoneNumber.number
        );
        if (!phoneNumber) {
          const newPhoneNumber = await addPhoneNumber({
            countryCode: data.phoneNumber.countryCode,
            number: data.phoneNumber.number,
          });
          phoneNumberId = newPhoneNumber.id;
        } else {
          phoneNumberId = phoneNumber.id;
        }
      }
    }

    const prompt = "addCustomer function says:";
    logger.info(`${prompt} Invoking CustomerRepository.create function...`);
    const customer = await CustomerRepository.create({
      customerId: data.customerId,
      name: data.name,
      type: data.type || "RESIDENTIAL",
      emailAddressId,
      phoneNumberId,
      imageId: data.imageId,
    });
    logger.info(`${prompt} Invocation of CustomerRepository.create function successfully completed.`);
    logger.info(`${prompt} Customer created with ID: ${customer.id}`);
    logger.info(`${prompt} Returning the created customer with ID: ${customer.id} to the caller.`);
    return customer;
  } catch (error) {
    logger.error({ error, data }, "Error creating customer");
    throw error;
  }
}

export async function updateCustomer(
  id: string,
  data: {
    name?: string;
    type?: CustomerType;
    emailAddressId?: string | null;
    phoneNumberId?: string | null;
    imageId?: string | null;
  }
) {
  const prompt = "updateCustomer function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking CustomerRepository.update function with ID: ${id}...`);
  try {
    const customer = await CustomerRepository.update(id, {
      name: data.name,
      type: data.type,
      emailAddressId: data.emailAddressId,
      phoneNumberId: data.phoneNumberId,
      imageId: data.imageId,
    });
    logger.info(`${prompt} Invocation of CustomerRepository.update function successfully completed.`);
    logger.info(`${prompt} Customer updated: ${customer.id}`);
    logger.info(`${prompt} Returning the updated customer with ID: ${customer.id} to the caller.`);
    return customer;
  } catch (error) {
    logger.error({ error, id, data }, `${prompt} Error updating customer`);
    throw error;
  }
}

export async function deleteCustomer(id: string) {
  const prompt = 'deleteCustomer function says:';
  logger.info(`${prompt} Attempting to delete customer with ID: ${id}`);
  try {
    // First, check if customer exists
    logger.info(`${prompt} Invoking findCustomerById function to check if customer exists...`);
    const customer = await findCustomerById(id);

    if (!customer) {
      const errorMessage = `Customer with ID ${id} not found.`;
      logger.warn(`${prompt} Throwing error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Check if customer has associated bookings
    logger.info(`${prompt} Checking if customer has associated bookings...`);
    const bookingsCount = customer.bookings?.length || 0;

    if (bookingsCount > 0) {
      const errorMessage = `Cannot delete customer ${customer.name}. This customer has ${bookingsCount} booking${bookingsCount !== 1 ? 's' : ''} associated. Please delete or reassign the bookings first.`;
      logger.warn({ id, bookingsCount }, `${prompt} Throwing error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    logger.info(`${prompt} Customer has no associated bookings. Proceeding with deletion...`);
    logger.info(`${prompt} Invoking CustomerRepository.delete function...`);
    const deletedCustomer = await CustomerRepository.delete(id);
    logger.info(`${prompt} Invocation of CustomerRepository.delete function successfully completed.`);
    logger.info(`${prompt} Customer deleted: ${deletedCustomer.id}`);
    logger.info(`${prompt} Returning deleted customer: ${deletedCustomer.id}`);
    return deletedCustomer;
  } catch (error) {
    logger.error({ error, id }, `${prompt} Throwing error: Error deleting customer`);
    throw error;
  }
}

export async function deleteCustomerAndTheirBookings(id: string) {
  const prompt = 'deleteCustomerAndTheirBookings function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Attempting to delete customer with ID: ${id} and all associated bookings`);
  try {
    // First, check if customer exists
    logger.info(`${prompt} Invoking findCustomerById function to check if customer exists...`);
    const customer = await findCustomerById(id);

    if (!customer) {
      const errorMessage = `Customer with ID ${id} not found.`;
      logger.warn(`${prompt} Throwing error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Delete all associated bookings first
    const bookingsCount = customer.bookings?.length || 0;
    if (bookingsCount > 0) {
      logger.info(`${prompt} Customer has ${bookingsCount} booking${bookingsCount !== 1 ? 's' : ''} associated. Deleting them first...`);
      logger.info(`${prompt} Invoking CustomerRepository.deleteBookings function...`);
      await CustomerRepository.deleteBookings(id);
      logger.info(`${prompt} Invocation of CustomerRepository.deleteBookings function successfully completed.`);
      logger.info(`${prompt} Deleted ${bookingsCount} booking${bookingsCount !== 1 ? 's' : ''} associated with customer ${id}`);
    }

    // Now delete the customer
    logger.info(`${prompt} All bookings deleted. Proceeding with customer deletion...`);
    logger.info(`${prompt} Invoking CustomerRepository.delete function...`);
    const deletedCustomer = await CustomerRepository.delete(id);
    logger.info(`${prompt} Invocation of CustomerRepository.delete function successfully completed.`);
    logger.info(`${prompt} Customer deleted: ${deletedCustomer.id}`);
    logger.info(`${prompt} Returning deleted customer: ${deletedCustomer.id}`);
    return deletedCustomer;
  } catch (error) {
    logger.error({ error, id }, `${prompt} Throwing error: Error deleting customer and bookings`);
    throw error;
  }
}