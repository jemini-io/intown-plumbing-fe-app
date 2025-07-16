"use server";

import { ServiceTitanClient } from "@/lib/servicetitan";
import { env } from "@/lib/config/env";
import { BUSINESS_UNIT_ID, SERVICE_TO_JOB_TYPES_MAPPING } from "@/lib/utils/constants";


/**
 * Get Job Types by Service Titan ID from the constants file
 */
export async function getJobTypesByServiceTitanIds() {
  const serviceTitanClient = new ServiceTitanClient();

  const uniqueServiceTitanIds = Array.from(new Set(SERVICE_TO_JOB_TYPES_MAPPING.map((service) => service.serviceTitanId)));

  // Fetch job types with the specific ID
  const jobTypes = await serviceTitanClient.jpm.JobTypesService.jobTypesGetList({
    tenant: Number(env.servicetitan.tenantId),
    ids: uniqueServiceTitanIds.join(','),
    includeTotal: true,
    active: 'True'
  });

  if (!jobTypes.data || !Array.isArray(jobTypes.data)) {
    return [];
  }

  // Filter by business unit
  return jobTypes.data.filter((jobType) =>
    jobType.businessUnitIds.includes(BUSINESS_UNIT_ID)
  );
}