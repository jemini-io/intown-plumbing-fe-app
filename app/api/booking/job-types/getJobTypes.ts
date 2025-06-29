"use server";

import { AuthService } from "@/app/api/services/services";
import { JobTypesService } from "@/app/api/servicetitan-api/job-planning-management/job-types";
import { JobType } from "@/app/api/servicetitan-api/types";
import { env } from "@/lib/config/env";
import { BUSINESS_UNIT_ID } from "@/lib/utils/constants";

/**
 * This is not used right now as we're doing a static mapping.
 * Once we have an admin console this may be used to help admins map services.
 */
export async function getJobTypesByBusinessUnit(): Promise<JobType[]> {
  const authService = new AuthService(env.environment);
  const authToken = await authService.getAuthToken(
    env.servicetitan.clientId,
    env.servicetitan.clientSecret
  );

  const jobTypesService = new JobTypesService();

  let allJobTypes: JobType[] = [];
  let page = 1;
  const pageSize = 100;
  let totalCount = 0;

  do {
    console.log(`Fetching page ${page} of job types`);
    const jobTypes = await jobTypesService.getJobTypes(
      authToken,
      env.servicetitan.appKey,
      env.servicetitan.tenantId,
      {
        includeTotal: true,
        page,
        pageSize,
      }
    );

    if (jobTypes.data && Array.isArray(jobTypes.data)) {
      allJobTypes = allJobTypes.concat(jobTypes.data);
    }

    totalCount = jobTypes.totalCount || 0;
    page += 1;
  } while (allJobTypes.length < totalCount);

  const jobTypesByBusinessUnit = allJobTypes.filter((jobType: JobType) =>
    jobType.businessUnitIds.includes(BUSINESS_UNIT_ID)
  );

  return jobTypesByBusinessUnit;
}
