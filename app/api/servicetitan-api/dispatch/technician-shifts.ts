import { env } from "@/lib/config/env";
import axios from "axios";
import { ServiceTitanQueryResponse } from "../types";
import { CreateTechnicianShiftRequest, TechnicianShift, TechnicianShiftCreateResponse, TechnicianShiftQueryParams } from "./types";



export class TechnicianShiftsService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = env.servicetitan.baseUrl;
    }

    async getTechnicianShifts(
        authToken: string,
        appKey: string,
        tenantId: string,
        params?: TechnicianShiftQueryParams
    ): Promise<ServiceTitanQueryResponse<TechnicianShift>> {
        const url = `${this.baseUrl}/dispatch/v2/tenant/${tenantId}/technician-shifts`;
        const headers = {
            'ST-App-Key': appKey,
            'Authorization': `Bearer ${authToken}`
        };

        try {
            const response = await axios.get(url, { headers, params });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                console.error(`[TechnicianShiftsService.getTechnicianShifts] HTTP ${error.response.status}: ${error.response.statusText}`);
                console.error('Response data:', error.response.data);
                throw new Error(`Failed to get technician shifts: ${error.response.status} ${error.response.statusText} - ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                console.error(`[TechnicianShiftsService.getTechnicianShifts] No response received:`, error.request);
                throw new Error('No response received from server while getting technician shifts.');
            } else {
                console.error(`[TechnicianShiftsService.getTechnicianShifts] Error:`, error.message);
                throw new Error(`Error while getting technician shifts: ${error.message}`);
            }
        }
    }

    async createTechnicianShift(
        authToken: string,
        appKey: string,
        tenantId: string,
        request: CreateTechnicianShiftRequest
    ): Promise<TechnicianShiftCreateResponse> {
        const url = `${this.baseUrl}/dispatch/v2/tenant/${tenantId}/technician-shifts`;
        const headers = {
            'ST-App-Key': appKey,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        };

        try {
            const response = await axios.post(url, request, { headers });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                console.error(`[TechnicianShiftsService.createTechnicianShift] HTTP ${error.response.status}: ${error.response.statusText}`);
                console.error('Response data:', error.response.data);
                throw new Error(`Failed to create technician shift: ${error.response.status} ${error.response.statusText} - ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                console.error(`[TechnicianShiftsService.createTechnicianShift] No response received:`, error.request);
                throw new Error('No response received from server while creating technician shift.');
            } else {
                console.error(`[TechnicianShiftsService.createTechnicianShift] Error:`, error.message);
                throw new Error(`Error while creating technician shift: ${error.message}`);
            }
        }
    }
} 