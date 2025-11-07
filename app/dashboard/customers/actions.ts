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
    select: {
      id: true,
      customerId: true,
      name: true,
      type: true,
      emailAddress: true,
      phoneNumber: true,
      bookings: true,
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
  logger.info(`Fetching customer with ID: ${id}`);
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
    logger.warn(`Customer with ID ${id} not found`);
  }
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
  logger.info(`Deleting customer with ID: ${id}`);
  try {
    const customer = await prisma.customer.delete({
      where: { id },
    });
    logger.info(`Customer deleted: ${customer.id}`);
    return customer;
  } catch (error) {
    logger.error({ error, id }, "Error deleting customer");
    throw error;
  }
}