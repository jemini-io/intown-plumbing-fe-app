import { env } from '@/lib/config/env';
import { ServiceTitanClient } from "@/lib/servicetitan";
import { Accounting_V2_InvoiceUpdateRequest, Accounting_V2_PaymentCreateRequest } from "@/lib/servicetitan/generated/accounting";
import { Crm_V2_Customers_CreateCustomerRequest } from "@/lib/servicetitan/generated/crm";
import { Jpm_V2_JobResponse } from "@/lib/servicetitan/generated/jpm";
import { getProductDetails } from "@/lib/stripe/product-lookup";
import { config } from "@/lib/config";
import type { Customer, Job, Location } from './types';
import pino from "pino";

const logger = pino({ name: "createJobAppointment" });

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
    const tenantId = Number(env.servicetitan.tenantId);

    // Calculate appointmentStartsBefore
    const appointmentStartsBefore = new Date(new Date(endTime).getTime() + 30 * 60000).toISOString();

    logger.info("Checking if customer already exists");

    // Check if a customer already exists
    const existingCustomers = await serviceTitanClient.crm.CustomersService.customersGetList({
        tenant: tenantId,
        name: name,
        street: street,
        zip: zip,
        phone: phone,
    });
    let stCustomer;

    if (existingCustomers && existingCustomers.data && existingCustomers.data.length > 0) {
        // console.log('Customer already exists:', existingCustomers.data[0].id);
        logger.info({ customerId: existingCustomers.data[0].id }, "Customer already exists");
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
            logger.error("Customer does not have any locations");
            throw new Error('Customer does not have any locations.');
        }
    } else {
        logger.info("Creating new customer");

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
        // console.log("Customer created:", customerResponse.id);
        logger.info({ customerId: customerResponse.id }, "Customer created");
        stCustomer = customerResponse;
    }

    // Ensure customer has at least one location
    if (!stCustomer.locations || stCustomer.locations.length === 0) {
        logger.error("Customer does not have any locations");
        throw new Error('Customer does not have any locations.');
    }

    // Check if a job already exists
    logger.info("Checking for existing jobs");
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
        // console.log('Job already exists:', existingJobs.data[0].id);
        logger.info({ jobId: existingJobs.data[0].id }, "Job already exists");
        return existingJobs.data[0];
    }

    // Create job
    const jobData = {
        customerId: Number(stCustomer.id),
        locationId: Number(stCustomer.locations[0].id),
        businessUnitId: Number(config.serviceTitan.businessUnitId),
        jobTypeId: Number(jobTypeId),
        priority: "Normal", // KEEP for now
        campaignId: Number(config.serviceTitan.campaignId),
        appointments: [{
            start: startTime,
            end: endTime,
            arrivalWindowStart: startTime,
            arrivalWindowEnd: endTime,
            technicianIds: [Number(technicianId)]
        }],
        summary: summary
    };
    // console.log("Job data:", jobData);
    // console.log("Creating job starting at:", startTime);
    logger.info({ jobData }, "Creating job");
    const jobResponse = await serviceTitanClient.jpm.JobsService.jobsCreate({
        tenant: tenantId,
        requestBody: jobData
    });
    // console.log("Job created:", jobResponse.id);
    logger.info({ jobId: jobResponse.id }, "Job created");

    // Get invoice by jobId
    const invoiceResponse = await serviceTitanClient.accounting.InvoicesService.invoicesGetList({
        tenant: tenantId,
        jobId: Number(jobResponse.id)
    });
    // console.log("Invoice Get by JobId response:", invoiceResponse.data);
    logger.debug({ invoiceCount: invoiceResponse.data?.length }, "Invoice lookup by job ID");

    if (invoiceResponse.data && invoiceResponse.data.length > 0) {
        const invoiceId = invoiceResponse.data[0].id;
        const productDetails = await getProductDetails(config.stripe.virtualConsultationProductName);
        const updatedInvoiceData: Accounting_V2_InvoiceUpdateRequest = {
            summary: config.stripe.virtualConsultationProductName,
            items: [
                {
                    skuId: config.serviceTitan.virtualServiceSkuId,
                    description: config.stripe.virtualConsultationProductName,
                    unitPrice: productDetails.stripePrice,
                    technicianId: Number(technicianId),
                    quantity: 1
                }
            ]
        };
        // console.log("Updating invoice data:", updatedInvoiceData);
        logger.info({ invoiceId, updatedInvoiceData }, "Updating invoice");
        await serviceTitanClient.accounting.InvoicesService.invoicesUpdateInvoice({
            tenant: tenantId,
            id: Number(invoiceId),
            requestBody: updatedInvoiceData
        });
        // console.log("Invoice updated:", invoiceId);
        logger.info({ invoiceId }, "Invoice updated");

        // Check for existing payments
        const paymentsResponse = await serviceTitanClient.accounting.PaymentsService.paymentsGetList({
            tenant: tenantId,
            appliedToInvoiceIds: String(invoiceId)
        });
        // console.log("Payments response:", paymentsResponse.data);
        logger.debug({ payments: paymentsResponse.data }, "Payment lookup by invoice ID");


        if (paymentsResponse && paymentsResponse.data && paymentsResponse.data.length > 0) {
            // console.log("Existing payments found:", paymentsResponse.data);
            logger.info({ payments: paymentsResponse.data }, "Existing payments found");
        } else {
            // Create payment if no existing payments
            const paymentData: Accounting_V2_PaymentCreateRequest = {
                typeId: config.serviceTitan.stripePaymentTypeId,
                memo: `Payment for ${config.stripe.virtualConsultationProductName}`, //TODO: improve memo
                paidOn: new Date().toISOString(), // Use current date or specify another date
                status: "Posted",
                splits: [{
                    invoiceId: Number(invoiceId),
                    amount: productDetails.stripePrice
                }]
            };
            // console.log("Payment data:", paymentData);
            logger.info({ paymentData }, "Creating payment");
            await serviceTitanClient.accounting.PaymentsService.paymentsCreate({
                tenant: tenantId,
                requestBody: paymentData
            });
        }
    }
    return jobResponse;
}
