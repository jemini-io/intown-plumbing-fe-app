"use server";

import { prisma } from "@/lib/prisma";
import pino from "pino";
import { CustomerType } from "@/lib/types/customer";
import { findEmailAddressById, findEmailAddressByAddress, addEmailAddress } from "@/app/dashboard/emailAddresses/actions";
import { findPhoneNumberById, findPhoneNumberByCountryCodeAndNumber, addPhoneNumber } from "@/app/dashboard/phoneNumbers/actions";

const logger = pino({ name: "customers-actions" });

export async function getAllCustomers() {
  const prompt = 'getAllCustomers function says:';
  logger.info(`${prompt} Fetching all customers`);
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: {
      emailAddress: true,
      phoneNumber: true,
      bookings: {
        include: {
          service: true,
        },
      },
      image: true,
    },
  });

  logger.info(`${prompt} Fetched ${customers.length} customers`);

  return customers.map(customer => ({
    ...customer,
    emailAddress: customer.emailAddress,
    phoneNumber: customer.phoneNumber,
  }));
}

// Optimized function for dropdowns - only fetches id and name
export async function getCustomersForDropdown() {
  return prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function findCustomerById(id: string) {
  const prompt = 'findCustomerById function says:';
  logger.info(`${prompt} Fetching customer with ID: ${id}...`);
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      emailAddress: true,
      phoneNumber: true,
      bookings: true,
      image: true,
    },
  });
  if (!customer) {
    logger.warn(`${prompt} Customer with ID ${id} not found`);
  } else {
    logger.info(`${prompt} Customer with ID ${id} found!`);
  }
  logger.info(`${prompt} Returning customer: ${customer?.id} to the caller...`);
  return customer;
}

export async function findCustomerByServiceTitanId(customerId: number) {
  logger.info(`Fetching customer with ServiceTitan ID: ${customerId}`);
  const customer = await prisma.customer.findUnique({
    where: { customerId },
    include: {
      emailAddress: true,
      phoneNumber: true,
      bookings: true,
      image: true,
    },
  });
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

    const customer = await prisma.customer.create({
      data: {
        customerId: data.customerId,
        name: data.name,
        type: data.type || "RESIDENTIAL",
        emailAddressId,
        phoneNumberId,
        imageId: data.imageId,
      },
      include: {
        emailAddress: true,
        phoneNumber: true,
        bookings: true,
        image: true,
      },
    });
    logger.info(`Customer created with ID: ${customer.id}`);
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
  logger.info(`Updating customer with ID: ${id}`);
  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.emailAddressId !== undefined && { emailAddressId: data.emailAddressId }),
        ...(data.phoneNumberId !== undefined && { phoneNumberId: data.phoneNumberId }),
        ...(data.imageId !== undefined && { imageId: data.imageId }),
      },
      include: {
        emailAddress: true,
        phoneNumber: true,
        bookings: true,
        image: true,
      },
    });
    logger.info(`Customer updated: ${customer.id}`);
    return customer;
  } catch (error) {
    logger.error({ error, id, data }, "Error updating customer");
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
      const errorMessage = `Cannot delete customer: This customer has ${bookingsCount} booking${bookingsCount !== 1 ? 's' : ''} associated. Please delete or reassign the bookings first.`;
      logger.warn({ id, bookingsCount }, `${prompt} Throwing error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    logger.info(`${prompt} Customer has no associated bookings. Proceeding with deletion...`);
    logger.info(`${prompt} Invoking prisma.customer.delete to delete customer...`);
    const deletedCustomer = await prisma.customer.delete({
      where: { id },
    });
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
      const bookingIds = customer.bookings.map(booking => booking.id);
      
      // Delete all bookings in a transaction
      await prisma.booking.deleteMany({
        where: {
          id: {
            in: bookingIds,
          },
        },
      });
      logger.info(`${prompt} Deleted ${bookingsCount} booking${bookingsCount !== 1 ? 's' : ''} associated with customer ${id}`);
    }

    // Now delete the customer
    logger.info(`${prompt} All bookings deleted. Proceeding with customer deletion...`);
    logger.info(`${prompt} Invoking prisma.customer.delete to delete customer...`);
    const deletedCustomer = await prisma.customer.delete({
      where: { id },
    });
    logger.info(`${prompt} Customer deleted: ${deletedCustomer.id}`);
    logger.info(`${prompt} Returning deleted customer: ${deletedCustomer.id}`);
    return deletedCustomer;
  } catch (error) {
    logger.error({ error, id }, `${prompt} Throwing error: Error deleting customer and bookings`);
    throw error;
  }
}