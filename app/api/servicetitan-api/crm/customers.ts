import axios from 'axios';
import { env } from "@/lib/config/env";
import { NewCustomer, CustomerResponse } from './types';

export class CustomerService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = env.servicetitan.baseUrl;
    }

    async createCustomer(authToken: string, appKey: string, tenantId: string, customerData: NewCustomer): Promise<CustomerResponse> {
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
