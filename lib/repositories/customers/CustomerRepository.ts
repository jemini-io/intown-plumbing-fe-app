/**
 * Repository for Customer entity
 * Encapsulates all database access for Customer
 */

import { prisma } from "@/lib/prisma";
import { Customer } from "@/lib/types/customer";
import pino from "pino";

const logger = pino({ name: "CustomerRepository" });

export class CustomerRepository {
  /**
   * Get all customers
   */
  static async findAll(): Promise<Customer[]> {
    const prompt = 'CustomerRepository.findAll function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.customer.findMany function...`);
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

    logger.info(`${prompt} Invocation of prisma.customer.findMany function successfully completed.`);
    logger.info(`${prompt} Returning array of ${customers.length} customers to the caller.`);
    return customers.map(customer => ({
      ...customer,
      emailAddress: customer.emailAddress,
      phoneNumber: customer.phoneNumber,
    }));
  }

  /**
   * Get customers for dropdown (optimized query)
   */
  static async findForDropdown() {
    return prisma.customer.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });
  }

  /**
   * Get customer by ID
   */
  static async findById(id: string): Promise<Customer | null> {
    const prompt = 'CustomerRepository.findById function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.customer.findUnique function...`);
    const customer = await prisma.customer.findUnique({
      where: { id },
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

    logger.info(`${prompt} Invocation of prisma.customer.findUnique function successfully completed.`);
    if (!customer) return null;
    logger.info(`${prompt} Returning customer: ${customer?.id} to the caller...`);
    return {
      ...customer,
      emailAddress: customer.emailAddress,
      phoneNumber: customer.phoneNumber,
    };
  }

  /**
   * Get customer by ServiceTitan ID
   */
  static async findByServiceTitanId(customerId: number): Promise<Customer | null> {
    const customer = await prisma.customer.findUnique({
      where: { customerId },
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

    if (!customer) return null;

    return {
      ...customer,
      emailAddress: customer.emailAddress,
      phoneNumber: customer.phoneNumber,
    };
  }

  /**
   * Create a new customer
   */
  static async create(data: {
    customerId: number;
    name: string;
    type: "RESIDENTIAL" | "COMMERCIAL";
    emailAddressId?: string | null;
    phoneNumberId?: string | null;
    imageId?: string | null;
  }): Promise<Customer> {
    const customer = await prisma.customer.create({
      data: {
        customerId: data.customerId,
        name: data.name,
        type: data.type,
        emailAddressId: data.emailAddressId,
        phoneNumberId: data.phoneNumberId,
        imageId: data.imageId,
      },
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

    return {
      ...customer,
      emailAddress: customer.emailAddress,
      phoneNumber: customer.phoneNumber,
      bookings: customer.bookings || [],
    };
  }

  /**
   * Update a customer
   */
  static async update(
    id: string,
    data: {
      name?: string;
      type?: "RESIDENTIAL" | "COMMERCIAL";
      emailAddressId?: string | null;
      phoneNumberId?: string | null;
      imageId?: string | null;
    }
  ): Promise<Customer> {
    const updateData: {
      name?: string;
      type?: "RESIDENTIAL" | "COMMERCIAL";
      emailAddressId?: string | null;
      phoneNumberId?: string | null;
      imageId?: string | null;
    } = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.emailAddressId !== undefined) updateData.emailAddressId = data.emailAddressId;
    if (data.phoneNumberId !== undefined) updateData.phoneNumberId = data.phoneNumberId;
    if (data.imageId !== undefined) updateData.imageId = data.imageId;

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
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

    return {
      ...customer,
      emailAddress: customer.emailAddress,
      phoneNumber: customer.phoneNumber,
      bookings: customer.bookings || [],
    };
  }

  /**
   * Delete customer bookings
   */
  static async deleteBookings(customerId: string) {
    const prompt = 'CustomerRepository.deleteBookings function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.booking.deleteMany function...`);
    const deletedBookings = await prisma.booking.deleteMany({
      where: {
        customerId,
      },
    });
    logger.info(`${prompt} Invocation of prisma.booking.deleteMany function successfully completed.`);
    logger.info(`${prompt} ${deletedBookings.count} bookings deleted.`);
    logger.info(`${prompt} Returning to the caller...`);
  }

  /**
   * Delete a customer
   */
  static async delete(id: string) {
    const prompt = 'CustomerRepository.delete function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.customer.delete function...`);
    const deletedCustomer = await prisma.customer.delete({
      where: { id },
    });
    logger.info(`${prompt} Invocation of prisma.customer.delete function successfully completed.`);
    logger.info(`${prompt} Returning deleted customer: ${deletedCustomer.id} to the caller...`);
    return deletedCustomer;
  }
}

