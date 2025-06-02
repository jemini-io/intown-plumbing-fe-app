import { AuthService, TechnicianService, AppointmentService, CustomerService, JobService, InvoiceService } from './services';
import { env } from "@/app/config/env";
import { toZonedTime, format, fromZonedTime } from 'date-fns-tz';

const { servicetitan: { clientId, clientSecret, appKey, tenantId, technicianId }, environment } = env;

// Convert shift and appointment times to CT
const convertToCT = (dateString: string) => {
    const date = new Date(dateString);
    const timeZone = 'America/Chicago';
    return toZonedTime(date, timeZone);
};

async function getAvailableTimeSlots(): Promise<any> {
    const authService = new AuthService(environment);
    const technicianService = new TechnicianService(environment);
    const appointmentService = new AppointmentService(environment);

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Get auth token
    const authToken = await authService.getAuthToken(clientId, clientSecret);

    // Fetch technician shifts
    const shiftsResponse = await technicianService.getTechShifts(authToken, appKey, tenantId, technicianId, todayStr);
    const shifts = shiftsResponse.data;

    // Filter shifts for the next 2 weeks, including today
    const twoWeeksFromNow = new Date(today);
    twoWeeksFromNow.setDate(today.getDate() + 14);
    const filteredShifts = shifts.filter((shift: any) => {
        const shiftDate = new Date(shift.start);
        // Include today's shifts by comparing only the date part
        return shiftDate.toISOString().split('T')[0] >= todayStr && shiftDate <= twoWeeksFromNow;
    });

    // console.log(filteredShifts);
    // Fetch appointments
    const appointmentsResponse = await appointmentService.getAppointments(authToken, appKey, tenantId, todayStr, technicianId);
    const appointments = appointmentsResponse.data;
    // console.log(appointments);
    // Process available time slots
    const availableTimeSlots: { date: string, timeSlots: string[] }[] = []; 

    filteredShifts.forEach((shift: any) => {
        const shiftDate = new Date(shift.start).toISOString().split('T')[0];
        const shiftStart = convertToCT(shift.start);
        const shiftEnd = convertToCT(shift.end);
        // Create 30-minute blocks
        let currentTime = new Date(shiftStart);
        const timeSlots: string[] = [];

        while (currentTime < shiftEnd) {
            const currentTimeStr = format(currentTime, 'HH:mm', { timeZone: 'America/Chicago' });
            const nextTime = new Date(currentTime);
            
            nextTime.setMinutes(currentTime.getMinutes() + 30);

            // Check if the current time block is available
            const isAvailable = !appointments.some((appointment: any) => {
                const appointmentStart = convertToCT(appointment.arrivalWindowStart);
                const appointmentEnd = convertToCT(appointment.arrivalWindowEnd);
                return currentTime >= appointmentStart && currentTime < appointmentEnd;
            });

            // Add time slot if available and meets the criteria
            const oneHourFromNow = new Date(today.getTime() + 60 * 60 * 1000);
            if (isAvailable && (shiftDate !== todayStr || currentTime > oneHourFromNow)) {
                timeSlots.push(currentTimeStr);
            }

            currentTime = nextTime;
        }

        if (timeSlots.length > 0) {
            availableTimeSlots.push({ date: shiftDate, timeSlots });
        }
    });
    // console.log(availableTimeSlots);
    return availableTimeSlots;
}

async function createJobAppointmentHandler(name: string, email: string, phone: string, startTime: string, endTime: string): Promise<any> {
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
    let customer = { id: null, locations: [] };
    if (existingCustomers && existingCustomers.data && existingCustomers.data.length > 0) {
        console.log('Customer already exists:', existingCustomers.data[0].id);
        customer = existingCustomers.data[0];

        // Fetch locations for the existing customer
        const locationsResponse = await customerService.getLocation(authToken, appKey, tenantId, customer.id);
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
        businessUnitId: 4282891, //STATIC: "Virtual Service" business unit
        jobTypeId: 1689, //TODO: Make this dynamic
        priority: "Normal", // KEEP for now
        campaignId: 46989774, // STATIC: "Direct Web Traffic" campaign
        appointments: [{
            start: startTime,
            end: endTime,
            arrivalWindowStart: startTime,
            arrivalWindowEnd: endTime,
            technicianIds: [technicianId] //TODO: update technician id for available technician
        }],
        summary: "Jemini test of services" //TODO: Make this dynamic
    };

    console.log("Creating job starting at:", startTime);
    const jobResponse = await jobService.createJob(authToken, appKey, tenantId, jobData);
    console.log("Job created:", jobResponse.id);
    const invoiceResponse = await invoiceService.getInvoiceByJobId(authToken, appKey, tenantId, jobResponse.id);
    if (invoiceResponse && invoiceResponse.data && invoiceResponse.data.length > 0) {
        const invoiceId = invoiceResponse.data[0].id;
        const updatedInvoiceData = {
            summary: "test invoice test", //TODO: change summary to the summary of the invoice
            items: [
                {
                    skuName: "VIRTUALSERVICE", //TODO: change skuName to the sku name of the service
                    description: "New Service Jemini", //TODO: change description to the description of the service
                    unitPrice: 100, //TODO: change amount to the amount of the service
                    technicianId: 34365881, // TODO: Replace with actual technician ID
                    quantity: 1
                }
            ]
        };
        await invoiceService.updateInvoice(authToken, appKey, tenantId, invoiceId, updatedInvoiceData);
        
        // Check for existing payments
        const paymentsResponse = await invoiceService.getPaymentsByInvoiceId(authToken, appKey, tenantId, invoiceId);
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
        }
    }

    return jobResponse;
}

export { getAvailableTimeSlots, createJobAppointmentHandler }; 