"use server";

import { prisma } from "@/lib/prisma";
import pino from "pino";
import { sanitizeCountryCode } from "@/lib/utils/phoneNumber/sanitization";

const logger = pino({ name: "phoneNumbers-actions" });

/**
 * Parses a phone number string to extract country code and number.
 * Assumes format like "+1-555-123-4567" or "15551234567" or "555-123-4567"
 * 
 * Note: ServiceTitan normalizes phone numbers and removes country codes,
 * so numbers from ServiceTitan API will typically be 10 digits without country code.
 * In such cases, we assume US country code "1".
 */
export async function parsePhoneNumber(phone: string): Promise<{ countryCode: string; number: string } | null> {
  if (!phone) return null;

  let countryCode = "1"; // Default to US (ServiceTitan normalizes to US numbers)
  let number = phone.replace(/[^\d]/g, ""); // Remove all non-digits

  // If phone has exactly 10 digits, assume it's a US number without country code
  // (ServiceTitan normalizes numbers this way)
  if (number.length === 10) {
    countryCode = "1";
    // number is already correct (10 digits)
  } else if (number.startsWith("1") && number.length === 11) {
    // If phone starts with 1 and has 11 digits, extract country code
    countryCode = "1";
    number = number.substring(1); // Remove country code, leaving 10 digits
  } else if (number.length > 10) {
    // If longer than 10 digits, assume first digits are country code
    // This is a simple heuristic - you may want to use a library like libphonenumber-js
    countryCode = number.substring(0, number.length - 10);
    number = number.substring(number.length - 10);
  } else if (number.length < 10) {
    // Invalid phone number (too short)
    logger.warn({ phone, parsedNumber: number }, "Phone number has less than 10 digits, may be invalid");
    // Still return with default country code, but log warning
  }

  return { countryCode, number };
}

export async function getAllPhoneNumbers() {
  logger.info("Fetching all phone numbers");
  const phoneNumbers = await prisma.phoneNumber.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customers: true,
    },
  });
  logger.info(`Fetched ${phoneNumbers.length} phone numbers`);
  return phoneNumbers;
}

export async function findPhoneNumberById(id: string) {
  logger.info(`Fetching phone number with ID: ${id}`);
  const phoneNumber = await prisma.phoneNumber.findUnique({
    where: { id },
    include: {
      customers: true,
    },
  });
  if (!phoneNumber) {
    logger.warn(`Phone number with ID ${id} not found`);
  }
  return phoneNumber;
}

export async function findPhoneNumberByCountryCodeAndNumber(countryCode: string, number: string) {
  logger.info(`Fetching phone number with countryCode: ${countryCode}, number: ${number}`);

  const sanitizedCountryCode = sanitizeCountryCode(countryCode);
  
  const phoneNumber = await prisma.phoneNumber.findUnique({
    where: {
      countryCode_number: {
        countryCode: sanitizedCountryCode,
        number,
      },
    },
    include: {
      customers: {
        include: {
          image: true,
        },
      },
    },
  });
  return phoneNumber;
}

export async function addPhoneNumber(data: { countryCode: string; number: string }) {
  logger.info(`Creating phone number: ${data.countryCode} ${data.number}`);
  
  const sanitizedCountryCode = sanitizeCountryCode(data.countryCode);
  
  try {
    const phoneNumber = await prisma.phoneNumber.create({
      data: {
        countryCode: sanitizedCountryCode,
        number: data.number,
      },
      include: {
        customers: true,
      },
    });
    logger.info(`Phone number created with ID: ${phoneNumber.id}`);
    return phoneNumber;
  } catch (error) {
    logger.error({ error, data }, "Error creating phone number");
    throw error;
  }
}

export async function updatePhoneNumber(id: string, data: { countryCode?: string; number?: string }) {
  logger.info(`Updating phone number with ID: ${id}`);
  

  if (data.countryCode !== undefined) {
    data.countryCode = sanitizeCountryCode(data.countryCode);
  }

  try {
    const phoneNumber = await prisma.phoneNumber.update({
      where: { id },
      data: {
        ...(data.countryCode !== undefined && { countryCode: data.countryCode }),
        ...(data.number !== undefined && { number: data.number }),
      },
      include: {
        customers: true,
      },
    });
    logger.info(`Phone number updated: ${phoneNumber.id}`);
    return phoneNumber;
  } catch (error) {
    logger.error({ error, id, data }, "Error updating phone number");
    throw error;
  }
}

export async function deletePhoneNumber(id: string) {
  logger.info(`Deleting phone number with ID: ${id}`);
  try {
    const phoneNumber = await prisma.phoneNumber.delete({
      where: { id },
    });
    logger.info(`Phone number deleted: ${phoneNumber.id}`);
    return phoneNumber;
  } catch (error) {
    logger.error({ error, id }, "Error deleting phone number");
    throw error;
  }
}
