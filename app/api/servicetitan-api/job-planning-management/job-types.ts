import { env } from "@/lib/config/env";
import { JobType, ServiceTitanQueryResponse } from "../types";
import axios from "axios";
import { JobTypesQueryParams } from "./types";

export class JobTypesService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.servicetitan.baseUrl;
  }

  async getJobTypes(authToken: string, appKey: string, tenantId: string, params?: JobTypesQueryParams): Promise<ServiceTitanQueryResponse<JobType>> {
    const url = `${this.baseUrl}/jpm/v2/tenant/${tenantId}/job-types`;
    const headers = {
      'ST-App-Key': appKey,
      'Authorization': `Bearer ${authToken}`
    };
    
    const response = await axios.get(url, { headers, params });
    return response.data;
  }

  async getJobType(authToken: string, appKey: string, tenantId: string, jobTypeId: number): Promise<JobType> {
    const url = `${this.baseUrl}/jpm/v2/tenant/${tenantId}/job-types/${jobTypeId}`;
    const headers = {
      'ST-App-Key': appKey,
      'Authorization': `Bearer ${authToken}`
    };
    const response = await axios.get(url, { headers });
    return response.data;
  }
}
