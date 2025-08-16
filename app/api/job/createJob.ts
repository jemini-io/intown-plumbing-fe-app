import { env } from '@/lib/config/env';
import { ServiceTitanClient } from "@/lib/servicetitan";
import { Accounting_V2_InvoiceUpdateRequest, Accounting_V2_PaymentCreateRequest } from "@/lib/servicetitan/generated/accounting";
import { Crm_V2_Customers_CreateCustomerRequest } from "@/lib/servicetitan/generated/crm";
import { Jpm_V2_JobResponse } from "@/lib/servicetitan/generated/jpm";
import { getProductDetails } from "@/lib/stripe/product-lookup";
import { getServiceTitanConfig, getStripeConfig, getDefaultManagedTechId } from "@/lib/appSettings/getConfig";
import type { Customer, Job, Location } from './types';
import { TenantSettings_V2_TechnicianResponse } from '@/lib/servicetitan/generated/settings/models/TenantSettings_V2_TechnicianResponse';
import { logger } from "../logger";

const tenantId = Number(env.servicetitan.tenantId);

export async function createJobAppointment({ 
  job,
  location,
  customer,
}: { 
  job: Job, 
  location: Location, 
  customer: Customer,
  productName?: string
}): Promise<Jpm_V2_JobResponse> {
    const serviceTitanClient = new ServiceTitanClient();

    const { startTime, endTime, technicianId, jobTypeId, summary } = job;
    const { street, unit, city, state, zip, country } = location;
    const { name, email, phone,
      billToStreet, billToUnit, billToCity, billToState, billToZip, billToSameAsService
    } = customer;

    // Calculate appointmentStartsBefore
    const appointmentStartsBefore = new Date(new Date(endTime).getTime() + 30 * 60000).toISOString();

    logger.info({
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
    }, "createJobAppointment: Checking if customer already exists");

    // Check if a customer already exists
    const existingCustomers = await serviceTitanClient.crm.CustomersService.customersGetList({
        tenant: tenantId,
        // Per Brittany, only match on phone.
        // name: name,
        // street: street,
        // zip: zip,
        phone: phone,
    });
    let stCustomer;

    if (existingCustomers && existingCustomers.data && existingCustomers.data.length > 0) {
        logger.info({
          customerId: existingCustomers.data[0].id,
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
        }, "createJobAppointment: Customer already exists");
        stCustomer = existingCustomers.data[0];

        // Fetch locations for the existing customer
        const locationsResponse = await serviceTitanClient.crm.LocationsService.locationsGetList({
            tenant: tenantId,
            customerId: Number(stCustomer?.id || 0)
        });
        if (locationsResponse && locationsResponse.data && locationsResponse.data.length > 0) {
            // Add locations to the customer object
            stCustomer = { ...stCustomer, locations: locationsResponse.data };
        } else {
            // create a new location
            logger.info({
              customerName: name,
              customerPhone: phone,
              customerEmail: email,
            }, "createJobAppointment: Customer does not have any locations, creating new location");
            const newLocation = await serviceTitanClient.crm.LocationsService.locationsCreate({
              tenant: tenantId,
              requestBody: {
                customerId: Number(stCustomer.id),
                name: `${name} Service Address`,
                address: {
                  street,
                  unit,
                  city,
                  state,
                  zip,
                  country
                },
              }
            });
            stCustomer = { ...stCustomer, locations: [newLocation] };
        }
    } else {
        logger.info({
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
        }, "createJobAppointment: Creating new customer");

        const customerData: Crm_V2_Customers_CreateCustomerRequest = {
            name,
            type: "Residential",
            doNotMail: true,
            doNotService: false,
            locations: [{
                name: `${name} Service Address`,
                address: {
                    street,
                    unit,
                    city,
                    state,
                    zip,
                    country
                },
                contacts: [
                    {
                        type: "Phone",
                        value: phone,
                        memo: null
                    },
                    {
                        type: "Email",
                        value: email,
                        memo: null
                    }
                ]
            }],
            address: {
                street: billToSameAsService ? street : (billToStreet || ''),
                unit: billToSameAsService ? unit : (billToUnit || ''),
                city: billToSameAsService ? city : (billToCity || ''),
                state: billToSameAsService ? state : (billToState || ''),
                zip: billToSameAsService ? zip : (billToZip || ''),
                country: billToSameAsService ? country : 'US'
            },
            contacts: [
                {
                    type: "Phone",
                    value: phone,
                    memo: null
                },
                {
                    type: "Email",
                    value: email,
                    memo: null
                }
            ]
        }
        const customerResponse = await serviceTitanClient.crm.CustomersService.customersCreate({
            tenant: tenantId,
            requestBody: customerData
        });
        logger.info({
          customerId: customerResponse.id,
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
        }, "createJobAppointment: Customer created");
        stCustomer = customerResponse;
    }

    // Ensure customer has at least one location
    if (!stCustomer.locations || stCustomer.locations.length === 0) {
        logger.warn({
          customerId: stCustomer.id,
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          customerLocations: stCustomer.locations,
        }, "Customer does not have any locations");
        throw new Error('Customer does not have any locations.');
    }

    // Check if a job already exists
    logger.info({
      technicianId: technicianId,
      startTime: startTime,
      endTime: endTime,
    }, "createJobAppointment: Checking for existing jobs");
    const existingJobs = await serviceTitanClient.jpm.JobsService.jobsGetList({
        tenant: tenantId,
        technicianId: Number(technicianId),
        firstAppointmentStartsOnOrAfter: startTime,
        firstAppointmentStartsBefore: appointmentStartsBefore,
        appointmentStatus: 'Scheduled',
        page: 1,
        pageSize: 10
    });
    if (existingJobs && existingJobs.data && existingJobs.data.length > 0) {
        logger.info({
          jobId: existingJobs.data[0].id,
          technicianId: technicianId,
          startTime: startTime,
          endTime: endTime,
        }, "createJobAppointment: Job already exists");
        return existingJobs.data[0];
    }

    const serviceTitanConfig = await getServiceTitanConfig();

    // Create job
    const jobData = {
        customerId: Number(stCustomer.id),
        locationId: Number(stCustomer.locations[0].id),
        businessUnitId: Number(serviceTitanConfig.businessUnitId),
        jobTypeId: Number(jobTypeId),
        priority: "Normal", // KEEP for now
        campaignId: Number(serviceTitanConfig.campaignId),
        appointments: [{
            start: startTime,
            end: endTime,
            arrivalWindowStart: startTime,
            arrivalWindowEnd: endTime,
            technicianIds: [Number(technicianId)]
        }],
        summary: summary
    };

    logger.info({
      jobData: jobData,
    }, "createJobAppointment: Creating job");
    const jobResponse = await serviceTitanClient.jpm.JobsService.jobsCreate({
        tenant: tenantId,
        requestBody: jobData
    });
    logger.info({
      jobId: jobResponse.id,
    }, "createJobAppointment: Job created");

    // Check and assign managed tech if needed
    try {
      await checkAndAssignManagedTech(jobResponse, Number(technicianId));
    } catch (error) {
      logger.error({ err: error }, "createJobAppointment: Error checking and assigning managed tech");
    }

    try {
      await updateInvoiceAndPayment(jobResponse, serviceTitanClient, Number(technicianId));
    } catch (error) {
      logger.error({ err: error }, "createJobAppointment: Error updating invoice and payment");
    }

    return jobResponse;
}

async function updateInvoiceAndPayment(jobResponse: Jpm_V2_JobResponse, serviceTitanClient: ServiceTitanClient, technicianId: number): Promise<void> {
    // Get invoice by jobId
    const invoiceResponse = await serviceTitanClient.accounting.InvoicesService.invoicesGetList({
        tenant: tenantId,
        jobId: Number(jobResponse.id)
    });

    logger.debug({
      invoiceCount: invoiceResponse.data?.length,
    }, "createJobAppointment: Invoice lookup by job ID");

    if (invoiceResponse.data && invoiceResponse.data.length > 0) {
        const invoiceId = invoiceResponse.data[0].id;
        const stripeConfig = await getStripeConfig();
        const virtualConsultationProductName = stripeConfig.virtualConsultationProductName;
        const productDetails = await getProductDetails(virtualConsultationProductName);
        const serviceTitanConfig = await getServiceTitanConfig();
        const updatedInvoiceData: Accounting_V2_InvoiceUpdateRequest = {
            summary: virtualConsultationProductName,
            items: [
                {
                    skuId: serviceTitanConfig.virtualServiceSkuId,
                    description: virtualConsultationProductName,
                    unitPrice: productDetails.stripePrice,
                    technicianId: Number(technicianId),
                    quantity: 1
                }
            ]
        };

        logger.info({
          invoiceId: invoiceId,
          updatedInvoiceData: updatedInvoiceData,
        }, "createJobAppointment: Updating invoice");
        await serviceTitanClient.accounting.InvoicesService.invoicesUpdateInvoice({
            tenant: tenantId,
            id: Number(invoiceId),
            requestBody: updatedInvoiceData
        });

        logger.info({
          invoiceId: invoiceId,
        }, "createJobAppointment: Invoice updated");

        // Check for existing payments
        const paymentsResponse = await serviceTitanClient.accounting.PaymentsService.paymentsGetList({
            tenant: tenantId,
            appliedToInvoiceIds: String(invoiceId)
        });

        logger.debug({
          payments: paymentsResponse.data,
        }, "createJobAppointment: Payment lookup by invoice ID");


        if (paymentsResponse && paymentsResponse.data && paymentsResponse.data.length > 0) {
            logger.info({
              payments: paymentsResponse.data,
            }, "createJobAppointment: Existing payments found");
        } else {
            // Create payment if no existing payments
            const paymentData: Accounting_V2_PaymentCreateRequest = {
                typeId: serviceTitanConfig.stripePaymentTypeId,
                memo: `Payment for ${virtualConsultationProductName}`, //TODO: improve memo
                paidOn: new Date().toISOString(), // Use current date or specify another date
                status: "Posted",
                splits: [{
                    invoiceId: Number(invoiceId),
                    amount: productDetails.stripePrice
                }]
            };

            try {
              logger.info({
                paymentData: paymentData,
              }, "createJobAppointment: Creating payment");
              await serviceTitanClient.accounting.PaymentsService.paymentsCreate({
                  tenant: tenantId,
                  requestBody: paymentData
              });
            } catch (error) {
              logger.warn({ err: error }, "createJobAppointment: Error creating payment");
            }
        }
    }
}

async function checkAndAssignManagedTech(
  jobResponse: Jpm_V2_JobResponse, 
  originalTechnicianId: number
): Promise<void> {
  const serviceTitanClient = new ServiceTitanClient();
  
  // Get original technician details
  const originalTech = await getTechnician(originalTechnicianId);
  
  // Check if original tech is non-managed
  if (!originalTech.isManagedTech) {
    logger.info({
      technicianId: originalTechnicianId,
      technicianName: originalTech.name,
    }, "createJobAppointment: Non-managed technician detected, assigning default managed tech");
    
    const appointmentId = jobResponse.firstAppointmentId;

    const defaultManagedTechId = await getDefaultManagedTechId();
    
    // Assign default managed tech to the appointment
    await serviceTitanClient.dispatch.AppointmentAssignmentsService.appointmentAssignmentsAssignTechnicians({
      tenant: tenantId,
      requestBody: {
        jobAppointmentId: appointmentId,
        technicianIds: [defaultManagedTechId]
      }
    });
    
    logger.info({ 
      jobId: jobResponse.id,
      originalTechId: originalTechnicianId,
      managedTechId: defaultManagedTechId
    }, "createJobAppointment: Successfully assigned default managed tech to appointment");
  }
}

export async function getTechnicianFromJob(jobId: number): Promise<TenantSettings_V2_TechnicianResponse> {
    const serviceTitanClient = new ServiceTitanClient();
    const appointments = await serviceTitanClient.dispatch.AppointmentAssignmentsService.appointmentAssignmentsGetList({
        tenant: tenantId,
        jobId: jobId
    });
    if (appointments.data.length > 1) {
        logger.warn({
          jobId: jobId,
        }, `createJobAppointment: Job ${jobId} has more than one appointment assignment. Using the first one.`);
    }
    const technicianId = appointments.data[0].technicianId;
    const technician = await serviceTitanClient.settings.TechniciansService.techniciansGet({
        tenant: tenantId,
        id: Number(technicianId)
    });
    return technician;
}

export async function getTechnician(technicianId: number): Promise<TenantSettings_V2_TechnicianResponse> {
    const serviceTitanClient = new ServiceTitanClient();
    const technician = await serviceTitanClient.settings.TechniciansService.techniciansGet({
        tenant: tenantId,
        id: technicianId
    });
    return technician;
}