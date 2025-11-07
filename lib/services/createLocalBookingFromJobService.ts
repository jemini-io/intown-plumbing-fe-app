import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/lib/types/booking";
import { ServiceTitanClient } from "@/lib/servicetitan";
import { env } from "@/lib/config/env";
import pino from "pino";
import { findCustomerByServiceTitanId, addCustomer } from "@/app/dashboard/customers/actions";
import { CustomerType } from "@/lib/types/customer";
import { parsePhoneNumber } from "@/app/dashboard/phoneNumbers/actions";

const logger = pino({ name: "create-local-booking-from-job-background-service" });
const tenantId = Number(env.servicetitan.tenantId);

export interface LocalBookingFromJobData {
  customerId: string; // ServiceTitan customer ID
  jobId: string; // ServiceTitan job ID
  serviceToJobTypeId: string; // ServiceTitan service to job type ID
  technicianId: string; // ServiceTitan technician ID
  scheduledFor: Date;
  status: BookingStatus;
  revenue: number;
  notes: string;
}

async function getOrCreateCustomer(serviceTitanCustomerId: number): Promise<string> {
  // Try to find existing customer by ServiceTitan ID
  const existing = await findCustomerByServiceTitanId(serviceTitanCustomerId);

  if (existing) {
    logger.info({ customerId: existing.id, serviceTitanId: serviceTitanCustomerId }, "Customer found locally");
    return existing.id;
  }

  // Customer doesn't exist, fetch from ServiceTitan and create
  logger.info({ serviceTitanId: serviceTitanCustomerId }, "Customer not found locally, fetching from ServiceTitan");
  const serviceTitanClient = new ServiceTitanClient();
  
  // Get customer details
  const customerResponse = await serviceTitanClient.crm.CustomersService.customersGet({
    tenant: tenantId,
    id: serviceTitanCustomerId,
  });

  if (!customerResponse) {
    throw new Error(`Customer with ServiceTitan ID ${serviceTitanCustomerId} not found`);
  }

  // Get customer contacts (email and phone)
  const contactsResponse = await serviceTitanClient.crm.CustomersService.customersGetContactList({
    tenant: tenantId,
    id: serviceTitanCustomerId,
    page: 1,
    pageSize: 10,
  });

  const emailContact = contactsResponse.data?.find(contact => 
    contact.type === "Email");
  const phoneContact = contactsResponse.data?.find(contact => 
    contact.type === "Phone");

  const email = emailContact?.value || "";
  const phone = phoneContact?.value || "";

  // Parse phone number
  const parsedPhone = await parsePhoneNumber(phone);

  const customerType: CustomerType = customerResponse.type.toLocaleLowerCase() === "commercial" ? "COMMERCIAL" : "RESIDENTIAL";
  
  const newCustomer = await addCustomer({
    customerId: serviceTitanCustomerId,
    name: customerResponse.name || `Customer ${serviceTitanCustomerId}`,
    type: customerType,
    emailAddress: email ? { address: email } : undefined,
    phoneNumber: parsedPhone ? {
      countryCode: parsedPhone.countryCode,
      number: parsedPhone.number,
    } : undefined,
  });

  logger.info({ customerId: newCustomer.id, serviceTitanId: serviceTitanCustomerId }, "Customer created locally");
  return newCustomer.id;
}

async function getOrCreateServiceToJobType(serviceTitanJobTypeId: number): Promise<string> {
  // Try to find existing service by ServiceTitan ID
  const existing = await prisma.serviceToJobType.findFirst({
    where: { serviceTitanId: serviceTitanJobTypeId },
  });

  if (existing) {
    logger.info({ serviceId: existing.id, serviceTitanId: serviceTitanJobTypeId }, "ServiceToJobType found locally");
    return existing.id;
  }

  // Service doesn't exist, fetch from ServiceTitan and create
  logger.info({ serviceTitanId: serviceTitanJobTypeId }, "ServiceToJobType not found locally, fetching from ServiceTitan");
  const serviceTitanClient = new ServiceTitanClient();
  const jobTypeResponse = await serviceTitanClient.jpm.JobTypesService.jobTypesGet({
    tenant: tenantId,
    id: serviceTitanJobTypeId,
  });

  if (!jobTypeResponse) {
    throw new Error(`JobType with ServiceTitan ID ${serviceTitanJobTypeId} not found`);
  }

  const newService = await prisma.serviceToJobType.create({
    data: {
      serviceTitanId: serviceTitanJobTypeId,
      displayName: jobTypeResponse.name || `Service ${serviceTitanJobTypeId}`,
      serviceTitanName: jobTypeResponse.name || `Service ${serviceTitanJobTypeId}`,
      emoji: "🔧", // Default emoji
      icon: "wrench", // Default icon
      description: jobTypeResponse.summary || "", // Use summary as description
      enabled: true,
    },
  });

  logger.info({ serviceId: newService.id, serviceTitanId: serviceTitanJobTypeId }, "ServiceToJobType created locally");
  return newService.id;
}

async function getOrCreateTechnician(serviceTitanTechnicianId: number): Promise<string> {
  // Try to find existing technician by ServiceTitan ID
  const existing = await prisma.technician.findUnique({
    where: { technicianId: serviceTitanTechnicianId },
  });

  if (existing) {
    logger.info({ technicianId: existing.id, serviceTitanId: serviceTitanTechnicianId }, "Technician found locally");
    return existing.id;
  }

  // Technician doesn't exist, fetch from ServiceTitan and create
  logger.info({ serviceTitanId: serviceTitanTechnicianId }, "Technician not found locally, fetching from ServiceTitan");
  const serviceTitanClient = new ServiceTitanClient();
  const technicianResponse = await serviceTitanClient.settings.TechniciansService.techniciansGet({
    tenant: tenantId,
    id: serviceTitanTechnicianId,
  });

  if (!technicianResponse) {
    throw new Error(`Technician with ServiceTitan ID ${serviceTitanTechnicianId} not found`);
  }

  const newTechnician = await prisma.technician.create({
    data: {
      technicianId: serviceTitanTechnicianId,
      technicianName: technicianResponse.name || `Technician ${serviceTitanTechnicianId}`,
      enabled: true,
      status: "AWAITING_JOB",
    },
  });

  logger.info({ technicianId: newTechnician.id, serviceTitanId: serviceTitanTechnicianId }, "Technician created locally");
  return newTechnician.id;
}

export async function createLocalBookingFromJob(bookingData: LocalBookingFromJobData) {
  setImmediate(async () => {
    try {
      logger.info("Background task started for creating local booking from job");
      
      // Normalize status to uppercase (ServiceTitan returns "Scheduled" but we need "SCHEDULED")
      const normalizedStatus = bookingData.status.toUpperCase() as BookingStatus;
      
      // Convert ServiceTitan IDs to numbers
      const stCustomerId = Number(bookingData.customerId);
      const stServiceId = Number(bookingData.serviceToJobTypeId);
      const stTechnicianId = Number(bookingData.technicianId);

      // Get or create Customer, ServiceToJobType, and Technician
      const [localCustomerId, localServiceId, localTechnicianId] = await Promise.all([
        getOrCreateCustomer(stCustomerId),
        getOrCreateServiceToJobType(stServiceId),
        getOrCreateTechnician(stTechnicianId),
      ]);

      // Create booking with local IDs
      const booking = await prisma.booking.create({
        data: {
          customerId: localCustomerId,
          jobId: bookingData.jobId,
          serviceId: localServiceId,
          technicianId: localTechnicianId,
          scheduledFor: new Date(bookingData.scheduledFor),
          status: normalizedStatus,
          revenue: bookingData.revenue ?? 0,
          notes: bookingData.notes,
        }
      });
      logger.info(booking, "Successfully created local booking from job (background)");
      
      return booking;
    } catch (err) {
      logger.error({ err }, "Error creating local booking from job:");
    }
  });
}