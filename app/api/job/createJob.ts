import { BUSINESS_UNIT_ID, CAMPAIGN_ID, VIRTUAL_SERVICE_SKU_ID } from '@/lib/utils/constants';
import { ServiceTitanClient } from "@/lib/servicetitan";
import type { Job, Location, Customer } from './types';
import { Crm_V2_Customers_CreateCustomerRequest } from "@/lib/servicetitan/generated/crm";
import { Jpm_V2_JobResponse } from "@/lib/servicetitan/generated/jpm";
import { Accounting_V2_PaymentCreateRequest } from "@/lib/servicetitan/generated/accounting";
import { env } from '@/lib/config/env';


export async function createJobAppointment({ job, location, customer }: { job: Job, location: Location, customer: Customer }): Promise<Jpm_V2_JobResponse> {
    const serviceTitanClient = new ServiceTitanClient();

    const { startTime, endTime, technicianId, jobTypeId, summary } = job;
    const { street, unit, city, state, zip, country } = location;
    const { name, email, phone,
      billToStreet, billToUnit, billToCity, billToState, billToZip, billToSameAsService
    } = customer;
    const tenantId = Number(env.servicetitan.tenantId);

    // Calculate appointmentStartsBefore
    const appointmentStartsBefore = new Date(new Date(endTime).getTime() + 30 * 60000).toISOString();

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
        console.log('Customer already exists:', existingCustomers.data[0].id);
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
            throw new Error('Customer does not have any locations.');
        }
    } else {
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
        console.log("Customer created:", customerResponse.id);
        stCustomer = customerResponse;
    }

    // Ensure customer has at least one location
    if (!stCustomer.locations || stCustomer.locations.length === 0) {
        throw new Error('Customer does not have any locations.');
    }

    // Check if a job already exists
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
        console.log('Job already exists:', existingJobs.data[0].id);
        return existingJobs.data[0];
    }

    // Create job
    const jobData = {
        customerId: Number(stCustomer.id),
        locationId: Number(stCustomer.locations[0].id),
        businessUnitId: Number(BUSINESS_UNIT_ID),
        jobTypeId: Number(jobTypeId),
        priority: "Normal", // KEEP for now
        campaignId: Number(CAMPAIGN_ID),
        appointments: [{
            start: startTime,
            end: endTime,
            arrivalWindowStart: startTime,
            arrivalWindowEnd: endTime,
            technicianIds: [Number(technicianId)]
        }],
        summary: summary
    };
    console.log("Job data:", jobData);
    console.log("Creating job starting at:", startTime);
    const jobResponse = await serviceTitanClient.jpm.JobsService.jobsCreate({
        tenant: tenantId,
        requestBody: jobData
    });
    console.log("Job created:", jobResponse.id);

    // Get invoice by jobId
    const invoiceResponse = await serviceTitanClient.accounting.InvoicesService.invoicesGetList({
        tenant: tenantId,
        jobId: Number(jobResponse.id)
    });
    console.log("Invoice response:", invoiceResponse.data);
    if (invoiceResponse && invoiceResponse.data && invoiceResponse.data.length > 0) {
        const invoiceId = invoiceResponse.data[0].id;
        const updatedInvoiceData = {
            summary: "test invoice test", //TODO: change summary to the summary of the invoice
            items: [
                {
                    skuId: VIRTUAL_SERVICE_SKU_ID, //TODO: change skuName to the sku name of the service
                    description: "New Service Jemini", //TODO: change description to the description of the service
                    unitPrice: 100, //TODO: change amount to the amount of the service
                    technicianId: Number(technicianId),
                    quantity: 1
                }
            ]
        };
        await serviceTitanClient.accounting.InvoicesService.invoicesUpdateInvoice({
            tenant: tenantId,
            id: Number(invoiceId),
            requestBody: updatedInvoiceData
        });
        console.log("Invoice updated:", invoiceId);
        // Check for existing payments
        const paymentsResponse = await serviceTitanClient.accounting.PaymentsService.paymentsGetList({
            tenant: tenantId,
            appliedToInvoiceIds: String(invoiceId)
        });
        console.log("Payments response:", paymentsResponse.data);
        if (paymentsResponse && paymentsResponse.data && paymentsResponse.data.length > 0) {
            console.log("Existing payments found:", paymentsResponse.data);
        } else {
            // Create payment if no existing payments
            const paymentData: Accounting_V2_PaymentCreateRequest = {
                typeId: 63, //TODO: get payment type to match the payment type paid by customer
                memo: "sum test", //TODO: improve memo
                paidOn: new Date().toISOString(), // Use current date or specify another date
                authCode: "123", //TODO: get auth code from customer
                status: "Posted",
                splits: [{
                    invoiceId: Number(invoiceId),
                    amount: 100.00 //TODO: change amount to the amount paid by customer
                }]
            };
            await serviceTitanClient.accounting.PaymentsService.paymentsCreate({
                tenant: tenantId,
                requestBody: paymentData
            });
            console.log("Payment created:", paymentData);
        }
    }
    return jobResponse;
}
