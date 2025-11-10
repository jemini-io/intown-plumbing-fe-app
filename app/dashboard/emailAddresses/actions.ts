"use server";

import { prisma } from "@/lib/prisma";
import pino from "pino";
import { isValidEmail } from "@/lib/utils/emailAddress/validation";

const logger = pino({ name: "emailAddresses-actions" });

export async function getAllEmailAddresses() {
  logger.info("Fetching all email addresses");
  const emailAddresses = await prisma.emailAddress.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customers: true,
    },
  });
  logger.info(`Fetched ${emailAddresses.length} email addresses`);
  return emailAddresses;
}

export async function findEmailAddressById(id: string) {
  logger.info(`Fetching email address with ID: ${id}`);
  const emailAddress = await prisma.emailAddress.findUnique({
    where: { id },
    include: {
      customers: true,
    },
  });
  if (!emailAddress) {
    logger.warn(`Email address with ID ${id} not found`);
  }
  return emailAddress;
}

export async function findEmailAddressByAddress(address: string) {
  logger.info(`Fetching email address with address: ${address}`);

  await validateEmailAddress(address);

  const emailAddress = await prisma.emailAddress.findUnique({
    where: { address },
    include: {
      customers: {
        include: {
          image: true,
        },
      },
    },
  });
  return emailAddress;
}

export async function addEmailAddress(data: { address: string }) {
  logger.info(`Creating email address: ${data.address}`);
  
  await validateEmailAddress(data.address);
  
  try {
    const emailAddress = await prisma.emailAddress.create({
      data: {
        address: data.address,
      },
      include: {
        customers: true,
      },
    });
    logger.info(`Email address created with ID: ${emailAddress.id}`);
    return emailAddress;
  } catch (error) {
    logger.error({ error, data }, "Error creating email address");
    throw error;
  }
}

export async function updateEmailAddress(id: string, data: { address?: string }) {
  logger.info(`Updating email address with ID: ${id}`);

  if (data.address !== undefined) {
    await validateEmailAddress(data.address);
  }

  try {
    const emailAddress = await prisma.emailAddress.update({
      where: { id },
      data: {
        ...(data.address !== undefined && { address: data.address }),
      },
      include: {
        customers: true,
      },
    });
    logger.info(`Email address updated: ${emailAddress.id}`);
    return emailAddress;
  } catch (error) {
    logger.error({ error, id, data }, "Error updating email address");
    throw error;
  }
}

export async function deleteEmailAddress(id: string) {
  logger.info(`Deleting email address with ID: ${id}`);
  try {
    const emailAddress = await prisma.emailAddress.delete({
      where: { id },
    });
    logger.info(`Email address deleted: ${emailAddress.id}`);
    return emailAddress;
  } catch (error) {
    logger.error({ error, id }, "Error deleting email address");
    throw error;
  }
}

export async function validateEmailAddress(address: string) {
  if (!isValidEmail(address)) {
    const error = new Error(`Invalid email address format: ${address}. Expected format: user@dominio.[ext]+`);
    logger.error({ error, address }, "Invalid email address format");
    throw error;
  }
}
