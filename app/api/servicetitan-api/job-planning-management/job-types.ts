import { env } from "@/lib/config/env";
import { JobType, ServiceTitanResponse } from "../types";
import axios from "axios";
import { JobTypesQueryParams } from "./types";

export class JobTypesService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.servicetitan.baseUrl;
  }

  async getJobTypes(authToken: string, appKey: string, tenantId: string, params?: JobTypesQueryParams): Promise<ServiceTitanResponse<JobType>> {
    const url = `${this.baseUrl}/jpm/v2/tenant/${tenantId}/job-types`;
    const headers = {
      'ST-App-Key': appKey,
      'Authorization': `Bearer ${authToken}`
    };
    
    const response = await axios.get(url, { headers, params });
    return response.data;
  }
}
