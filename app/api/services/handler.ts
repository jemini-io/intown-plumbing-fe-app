import { AuthService, TechnicianService, AppointmentService, CustomerService, JobService, InvoiceService } from './services';
import { env } from "@/lib/config/env";
import { toZonedTime, format, fromZonedTime } from 'date-fns-tz';
import { Appointment } from '../servicetitan-api/types';
import { ServiceTitanResponse } from '../servicetitan-api/types';
import { BUSINESS_UNIT_ID, CAMPAIGN_ID, VIRTUAL_SERVICE_SKU_NAME } from '@/lib/utils/constants';

const { servicetitan: { clientId, clientSecret, appKey, tenantId }, environment } = env;

interface Technician {
    id: string;
    name: string;
}

interface TimeSlot {
    time: string;
    technicians: Technician[];
}

interface DateEntry {
    date: string;
    timeSlots: TimeSlot[];
}

// Convert shift and appointment times to CT
const convertToCT = (dateString: string) => {
    const date = new Date(dateString);
    const timeZone = 'America/Chicago';
    return toZonedTime(date, timeZone);
};

/**
 * Need to get all technicians in the "Virtual Service" business unit
 */
async function getAvailableTimeSlots(): Promise<DateEntry[]> {
    const authService = new AuthService(environment);
    const technicianService = new TechnicianService(environment);
    const appointmentService = new AppointmentService(environment);

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Get auth token
    const authToken = await authService.getAuthToken(clientId, clientSecret);

    // NEW: Fetch all technicians
    const allTechsResponse = await technicianService.getAllTechnicians(authToken, appKey, tenantId);
    const allTechs = allTechsResponse.data || allTechsResponse; // adjust if API returns .data

    // Hardcoded business unit ID for filtering
    // TODO: Make this an environment variable
    const VIRTUAL_SERVICE_BU_ID = 76816943;

    // Filter technicians for the business unit
    const filteredTechs = allTechs.filter((tech: any) =>
        tech.businessUnitId === VIRTUAL_SERVICE_BU_ID
    );

    console.log(filteredTechs.length, "should be 2", filteredTechs.map((tech: any) => tech.name));

    // For each technician, fetch shifts and appointments, then aggregate
    const availableTimeSlots: DateEntry[] = [];

    for (const tech of filteredTechs) {
        // Fetch shifts for this technician
        const shiftsResponse = await technicianService.getTechShifts(authToken, appKey, tenantId, tech.id, todayStr);
        const shifts = shiftsResponse.data;

        // Filter shifts for the next 2 weeks, including today
        const twoWeeksFromNow = new Date(today);
        twoWeeksFromNow.setDate(today.getDate() + 14);
        const filteredShifts = shifts.filter((shift: any) => {
            const shiftDate = new Date(shift.start);
            return shiftDate.toISOString().split('T')[0] >= todayStr && shiftDate <= twoWeeksFromNow;
        });

        // Fetch appointments for this technician
        const appointmentsResponse = await appointmentService.getAppointments(authToken, appKey, tenantId, todayStr, tech.id);
        const {data: appointments} = appointmentsResponse as ServiceTitanResponse<Appointment>;

        // Process available time slots for this technician
        filteredShifts.forEach((shift: any) => {
            const shiftDate = new Date(shift.start).toISOString().split('T')[0];
            const shiftStart = convertToCT(shift.start);
            const shiftEnd = convertToCT(shift.end);
            let currentTime = new Date(shiftStart);

            while (currentTime < shiftEnd) {
                const currentTimeStr = format(currentTime, 'HH:mm', { timeZone: 'America/Chicago' });
                const nextTime = new Date(currentTime);
                nextTime.setMinutes(currentTime.getMinutes() + 30);

                // Check if the current time block is available
                const isAvailable = !appointments.some((appointment) => {
                    const appointmentStart = convertToCT(appointment.start);
                    const appointmentEnd = convertToCT(appointment.end);
                    return currentTime >= appointmentStart && currentTime < appointmentEnd;
                });

                // Add time slot if available and meets the criteria
                const oneHourFromNow = new Date(today.getTime() + 60 * 60 * 1000);
                if (isAvailable && (shiftDate !== todayStr || currentTime > oneHourFromNow)) {
                    // Find or create the date entry
                    let dateEntry = availableTimeSlots.find(slot => slot.date === shiftDate);
                    if (!dateEntry) {
                        dateEntry = { date: shiftDate, timeSlots: [] };
                        availableTimeSlots.push(dateEntry);
                    }

                    // Find or create the time slot entry
                    let timeSlotEntry = dateEntry.timeSlots.find(slot => slot.time === currentTimeStr);
                    if (!timeSlotEntry) {
                        timeSlotEntry = { time: currentTimeStr, technicians: [] };
                        dateEntry.timeSlots.push(timeSlotEntry);
                    }

                    // Add the technician to the time slot
                    timeSlotEntry.technicians.push({
                        id: tech.id,
                        name: tech.name
                    });
                }

                currentTime = nextTime;
            }
        });
    }

    // Sort time slots within each date
    availableTimeSlots.forEach(dateEntry => {
        dateEntry.timeSlots.sort((a, b) => a.time.localeCompare(b.time));
    });

    return availableTimeSlots;
}

async function createJobAppointmentHandler({
    name,
    email,
    phone,
    startTime,
    endTime,
    technicianId,
    jobTypeId
}: {
    name: string;
    email: string;
    phone: string;
    startTime: string;
    endTime: string;
    technicianId: string;
    jobTypeId?: number;
}): Promise<any> {
    const authService = new AuthService(environment);
    const jobService = new JobService(environment);
    const customerService = new CustomerService(environment);
    const invoiceService = new InvoiceService(environment);

    // Get auth token
    const authToken = await authService.getAuthToken(clientId, clientSecret);

    // Calculate appointmentStartsBefore
    const appointmentStartsBefore = new Date(new Date(endTime).getTime() + 30 * 60000).toISOString();

    // Create customer data
    const customerData = {
        name,
        type: "Residential",
        doNotMail: true,
        doNotService: false,
        locations: [{
            name: `${name} Residence`,
            address: {
                street: "123 Test", //TODO: change street to the street of the customer
                unit: "",
                city: "Test", //TODO: change city to the city of the customer
                state: "TX", //TODO: change state to the state of the customer
                zip: "12345", //TODO: change zip to the zip of the customer
                country: "USA" //TODO: change country to the country of the customer
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
            street: "123 Test",
            unit: "",
            city: "Test",
            state: "TX",
            zip: "12345",
            country: "USA"
        }
    };

    // Check if a customer already exists
    const existingCustomers = await customerService.getCustomer(authToken, appKey, tenantId, customerData.name, customerData.locations[0].address.street, customerData.locations[0].address.zip);
    let customer: any = { id: null, locations: [] };
    if (existingCustomers && existingCustomers.data && existingCustomers.data.length > 0) {
        console.log('Customer already exists:', existingCustomers.data[0].id);
        customer = existingCustomers.data[0];

        // Fetch locations for the existing customer
        const locationsResponse = await customerService.getLocation(authToken, appKey, tenantId, customer?.id || '');
        if (locationsResponse && locationsResponse.data && locationsResponse.data.length > 0) {
            customer.locations = locationsResponse.data;
        } else {
            throw new Error('Customer does not have any locations.');
        }
    } else {
        const customerResponse = await customerService.createCustomer(authToken, appKey, tenantId, customerData);
        console.log("Customer created:", customerResponse.id);
        customer = customerResponse;
    }

    // Ensure customer has at least one location
    if (!customer.locations || customer.locations.length === 0) {
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
        customerId: customer.id,
        locationId: customer.locations[0].id,
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
        summary: "Jemini test of services" //TODO: Make this dynamic
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
                    skuName: VIRTUAL_SERVICE_SKU_NAME, //TODO: change skuName to the sku name of the service
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

export { getAvailableTimeSlots, createJobAppointmentHandler }; 