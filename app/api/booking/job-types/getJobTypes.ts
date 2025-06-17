"use server";

import { AuthService } from "@/app/api/services/services";
import { JobTypesService } from "@/app/api/servicetitan-api/job-planning-management/job-types";
import { JobType } from "@/app/api/servicetitan-api/types";
import { env } from "@/lib/config/env";
import { BUSINESS_UNIT_ID, SERVICE_TO_JOB_TYPES_MAPPING } from "@/lib/utils/constants";


/**
 * Get Job Types by Service Titan ID from the constants file
 */
export async function getJobTypesByServiceTitanIds(): Promise<JobType[]> {
  const authService = new AuthService(env.environment);
  const authToken = await authService.getAuthToken(
    env.servicetitan.clientId,
    env.servicetitan.clientSecret
  );

  const jobTypesService = new JobTypesService();

  const uniqueServiceTitanIds = Array.from(new Set(SERVICE_TO_JOB_TYPES_MAPPING.map((service) => service.serviceTitanId)));

  // Fetch job types with the specific ID
  const jobTypes = await jobTypesService.getJobTypes(
    authToken,
    env.servicetitan.appKey,
    env.servicetitan.tenantId,
    {
      ids: uniqueServiceTitanIds,
      includeTotal: true,
      active: true
    }
  );

  if (!jobTypes.data || !Array.isArray(jobTypes.data)) {
    return [];
  }

  // Filter by business unit
  return jobTypes.data.filter((jobType: JobType) =>
    jobType.businessUnitIds.includes(BUSINESS_UNIT_ID)
  );
}