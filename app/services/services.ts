import axios from 'axios';
import { env } from "@/app/config/env"; // Adjust the path as necessary

// Use the environment variable from the imported config
const { environment } = env;

class AuthService {
    private baseUrl: string;

    constructor(environment: string) {
        this.baseUrl = environment === 'prod' ? 'https://auth.servicetitan.io' : 'https://auth-integration.servicetitan.io';
    }

    async getAuthToken(clientId: string, clientSecret: string): Promise<string> {
        const url = `${this.baseUrl}/connect/token`;
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const data = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        });

        const response = await axios.post(url, data, { headers });
        return response.data.access_token;
    }
}

class CustomerService {
    private baseUrl: string;

    constructor(environment: string) {
        this.baseUrl = environment === 'prod' ? 'https://api.servicetitan.io' : 'https://api-integration.servicetitan.io';
    }

    async createCustomer(authToken: string, appKey: string, tenantId: string, customerData: object): Promise<any> {
        const url = `${this.baseUrl}/crm/v2/tenant/${tenantId}/customers`;
        const headers = {
            'ST-App-Key': appKey,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.post(url, customerData, { headers });
        return response.data;
    }

    async getCustomer(authToken: string, appKey: string, tenantId: string, name: string, street: string, zip: string): Promise<any> {
        const url = `${this.baseUrl}/crm/v2/tenant/${tenantId}/customers?name=${encodeURIComponent(name)}&street=${encodeURIComponent(street)}&zip=${encodeURIComponent(zip)}`;
        const headers = {
            'ST-App-Key': appKey,
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.get(url, { headers });
        return response.data;
    }

    async getLocation(authToken: string, appKey: string, tenantId: string, customerId: string): Promise<any> {
        const url = `${this.baseUrl}/crm/v2/tenant/${tenantId}/locations?customerId=${customerId}`;
        const headers = {
            'ST-App-Key': appKey,
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.get(url, { headers });
        return response.data;
    }
}

class JobService {
    private baseUrl: string;

    constructor(environment: string) {
        this.baseUrl = environment === 'prod' ? 'https://api.servicetitan.io' : 'https://api-integration.servicetitan.io';
    }

    async createJob(authToken: string, appKey: string, tenantId: string, jobData: object): Promise<any> {
        const url = `${this.baseUrl}/jpm/v2/tenant/${tenantId}/jobs`;
        const headers = {
            'ST-App-Key': appKey,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.post(url, jobData, { headers });
        return response.data;
    }

    async getJob(authToken: string, appKey: string, tenantId: string, technicianId: string, appointmentStartsOnOrAfter: string, appointmentStartsBefore: string): Promise<any> {
        const url = `${this.baseUrl}/jpm/v2/tenant/${tenantId}/jobs?technicianId=${technicianId}&appointmentStartsOnOrAfter=${appointmentStartsOnOrAfter}&appointmentStartsBefore=${appointmentStartsBefore}&appointmentStatus=Scheduled`;
        const headers = {
            'ST-App-Key': appKey,
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.get(url, { headers });
        return response.data;
    }

    async getJobDetails(authToken: string, appKey: string, tenantId: string, jobId: string): Promise<any> {
        const url = `${this.baseUrl}/jpm/v2/tenant/${tenantId}/jobs/${jobId}`;
        const headers = {
            'ST-App-Key': appKey,
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.get(url, { headers });
        return response.data;
    }

    async completeJob(authToken: string, appKey: string, tenantId: string, jobId: string): Promise<any> {
        const url = `${this.baseUrl}/jpm/v2/tenant/${tenantId}/jobs/${jobId}/complete`;
        const headers = {
            'ST-App-Key': appKey,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        };

        const completedOn = new Date().toISOString(); // Current time in ISO format

        const response = await axios.post(url, { completedOn }, { headers });
        return response.data;
    }
}

class TechnicianService {
    private baseUrl: string;

    constructor(environment: string) {
        this.baseUrl = environment === 'prod' ? 'https://api.servicetitan.io' : 'https://api-integration.servicetitan.io';
    }

    async getTechShifts(authToken: string, appKey: string, tenantId: string, technicianId: string, startsOnOrAfter: string): Promise<any> {
        const url = `${this.baseUrl}/dispatch/v2/tenant/${tenantId}/technician-shifts?technicianId=${technicianId}&startsOnOrAfter=${startsOnOrAfter}`;
        const headers = {
            'ST-App-Key': appKey,
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.get(url, { headers });
        return response.data;
    }
}

class AppointmentService {
    private baseUrl: string;

    constructor(environment: string) {
        this.baseUrl = environment === 'prod' ? 'https://api.servicetitan.io' : 'https://api-integration.servicetitan.io';
    }

    async getAppointments(authToken: string, appKey: string, tenantId: string, startsOnOrAfter: string, technicianId: string): Promise<any> {
        const url = `${this.baseUrl}/jpm/v2/tenant/${tenantId}/appointments?startsOnOrAfter=${startsOnOrAfter}&technicianId=${technicianId}`;
        const headers = {
            'ST-App-Key': appKey,
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.get(url, { headers });
        return response.data;
    }
}

class InvoiceService {
    private baseUrl: string;

    constructor(environment: string) {
        this.baseUrl = environment === 'prod' ? 'https://api.servicetitan.io' : 'https://api-integration.servicetitan.io';
    }

    async getInvoiceByJobId(authToken: string, appKey: string, tenantId: string, jobId: string): Promise<any> {
        const url = `${this.baseUrl}/accounting/v2/tenant/${tenantId}/invoices?jobId=${jobId}`;
        const headers = {
            'ST-App-Key': appKey,
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.get(url, { headers });
        return response.data;
    }

    async updateInvoice(authToken: string, appKey: string, tenantId: string, invoiceId: string, updatedInvoiceData: object): Promise<any> {
        const url = `${this.baseUrl}/accounting/v2/tenant/${tenantId}/invoices/${invoiceId}`;
        const headers = {
            'ST-App-Key': appKey,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.patch(url, updatedInvoiceData, { headers });
        return response.data;
    }

    async adjustInvoiceTotal(authToken: string, appKey: string, tenantId: string, jobId: string) {
        const jobService = new JobService(environment);
        // Fetch the job to get the associated invoice ID
        const jobDetails = await jobService.getJobDetails(authToken, appKey, tenantId, jobId);
        const invoiceId = jobDetails.invoiceId;

        // Fetch the current invoice
        const invoice = await this.getInvoiceByJobId(authToken, appKey, tenantId, jobId);

        // Modify the invoice items to update the total
        const updatedInvoiceData = {
            ...invoice,
            items: [
                ...invoice.items,
                { description: "New Service", amount: 100, quantity: 1 } // Example item
            ]
        };

        // Update the invoice
        const updatedInvoice = await this.updateInvoice(authToken, appKey, tenantId, invoiceId, updatedInvoiceData);
        console.log("Updated Invoice:", updatedInvoice);
    }

    async createPayment(authToken: string, appKey: string, tenantId: string, paymentData: object): Promise<any> {
        const url = `${this.baseUrl}/accounting/v2/tenant/${tenantId}/payments`;
        const headers = {
            'ST-App-Key': appKey,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.post(url, paymentData, { headers });
        return response.data;
    }

    async getPaymentsByInvoiceId(authToken: string, appKey: string, tenantId: string, invoiceId: string): Promise<any> {
        const url = `${this.baseUrl}/accounting/v2/tenant/${tenantId}/payments?appliedToInvoiceIds=${invoiceId}`;
        const headers = {
            'ST-App-Key': appKey,
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.get(url, { headers });
        return response.data;
    }
}
export { AuthService, CustomerService, JobService, TechnicianService, AppointmentService, InvoiceService }; 
