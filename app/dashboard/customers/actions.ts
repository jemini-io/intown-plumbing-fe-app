"use server";

import { prisma } from "@/lib/prisma";
import pino from "pino";

const logger = pino({ name: "skills-actions" });

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