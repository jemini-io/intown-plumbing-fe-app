import { env } from "@/lib/config/env";
import { BUSINESS_UNIT_ID, CAMPAIGN_ID, VIRTUAL_SERVICE_SKU_ID } from '@/lib/utils/constants';
import { AuthService, InvoiceService, JobService } from "../services/services";
import { Job, Location, Customer } from "./types";
import { CustomerService } from "../servicetitan-api/crm/customers";
import { NewCustomer } from "../servicetitan-api/crm/types";

const { servicetitan: { clientId, clientSecret, appKey, tenantId }, environment } = env;

export async function createJobAppointment({ job, location, customer }: { job: Job, location: Location, customer: Customer }): Promise<any> {
    const authService = new AuthService(environment);
    const jobService = new JobService(environment);
    const customerService = new CustomerService();
    const invoiceService = new InvoiceService(environment);

    const { startTime, endTime, technicianId, jobTypeId, summary } = job;
    const { street, unit, city, state, zip, country } = location;
    const { name, email, phone } = customer;

    // Get auth token
    const authToken = await authService.getAuthToken(clientId, clientSecret);

    // Calculate appointmentStartsBefore
    const appointmentStartsBefore = new Date(new Date(endTime).getTime() + 30 * 60000).toISOString();

    // Check if a customer already exists
    const existingCustomers = await customerService.getCustomer(authToken, appKey, tenantId, name, street, zip);
    let stCustomer;

    if (existingCustomers && existingCustomers.data && existingCustomers.data.length > 0) {
        console.log('Customer already exists:', existingCustomers.data[0].id);
        stCustomer = existingCustomers.data[0];

        // Fetch locations for the existing customer
        const locationsResponse = await customerService.getLocation(authToken, appKey, tenantId, stCustomer?.id || '');
        if (locationsResponse && locationsResponse.data && locationsResponse.data.length > 0) {
            stCustomer.locations = locationsResponse.data;
        } else {
            throw new Error('Customer does not have any locations.');
        }
    } else {
        const customerData: NewCustomer = {
            name,
            type: "Residential",
            doNotMail: true,
            doNotService: false,
            locations: [{
                name: `${name} Residence`,
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
                street,
                unit,
                city,
                state,
                zip,
                country
            }
        }
        const customerResponse = await customerService.createCustomer(authToken, appKey, tenantId, customerData);
        console.log("Customer created:", customerResponse.id);
        stCustomer = customerResponse;
    }

    // Ensure customer has at least one location
    if (!stCustomer.locations || stCustomer.locations.length === 0) {
        throw new Error('Customer does not have any locations.');
    }

    // Check if a job already exists
    const existingJobs = await jobService.getJob(authToken, appKey, tenantId, technicianId, startTime, appointmentStartsBefore);
    if (existingJobs && existingJobs.data && existingJobs.data.length > 0) {
        console.log('Job already exists:', existingJobs.data[0].id);
        return existingJobs.data[0];
    }

    // Create job
    const jobData = {
        customerId: stCustomer.id,
        locationId: stCustomer.locations[0].id,
        businessUnitId: BUSINESS_UNIT_ID,
        jobTypeId: jobTypeId,
        priority: "Normal", // KEEP for now
        campaignId: CAMPAIGN_ID,
        appointments: [{
            start: startTime,
            end: endTime,
            arrivalWindowStart: startTime,
            arrivalWindowEnd: endTime,
            technicianIds: [technicianId]
        }],
        summary: summary
    };
    console.log("Job data:", jobData);
    console.log("Creating job starting at:", startTime);
    const jobResponse = await jobService.createJob(authToken, appKey, tenantId, jobData);
    console.log("Job created:", jobResponse.id);
    const invoiceResponse = await invoiceService.getInvoiceByJobId(authToken, appKey, tenantId, jobResponse.id);
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
                    technicianId: technicianId,
                    quantity: 1
                }
            ]
        };
        await invoiceService.updateInvoice(authToken, appKey, tenantId, invoiceId, updatedInvoiceData);
        console.log("Invoice updated:", invoiceId);
        
        // Check for existing payments
        const paymentsResponse = await invoiceService.getPaymentsByInvoiceId(authToken, appKey, tenantId, invoiceId);
        console.log("Payments response:", paymentsResponse.data);
        if (paymentsResponse && paymentsResponse.data && paymentsResponse.data.length > 0) {
            console.log("Existing payments found:", paymentsResponse.data);
        } else {
            // Create payment if no existing payments
            const paymentData = {
                typeId: 63, //TODO: get payment type to match the payment type paid by customer
                memo: "sum test", //TODO: improve memo
                paidOn: new Date().toISOString(), // Use current date or specify another date
                authCode: "123", //TODO: get auth code from customer
                status: "Posted", 
                splits: [{
                    invoiceId: invoiceId,
                    amount: 100.00 //TODO: change amount to the amount paid by customer
                }]
            };
            await invoiceService.createPayment(authToken, appKey, tenantId, paymentData);
            console.log("Payment created:", paymentData);
        }
    }

    return jobResponse;
}
