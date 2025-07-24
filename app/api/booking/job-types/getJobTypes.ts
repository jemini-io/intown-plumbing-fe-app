"use server";

import { ServiceTitanClient } from "@/lib/servicetitan";
import { env } from "@/lib/config/env";
import { config } from "@/lib/config";
import pino from "pino";

const logger = pino({ name: "getJobTypesByServiceTitanIds" });

/**
 * Get Job Types by Service Titan ID from the constants file
 */
export async function getJobTypesByServiceTitanIds() {
  logger.info("Fetching job types by ServiceTitan IDs"); 

  const serviceTitanClient = new ServiceTitanClient();

  const uniqueServiceTitanIds = Array.from(new Set(config.serviceToJobTypes.map((service) => service.serviceTitanId)));

  logger.debug({ uniqueServiceTitanIds }, "Unique ServiceTitan IDs");

  // Fetch job types with the specific ID
  const jobTypes = await serviceTitanClient.jpm.JobTypesService.jobTypesGetList({
    tenant: Number(env.servicetitan.tenantId),
    ids: uniqueServiceTitanIds.join(','),
    includeTotal: true,
    active: 'True'
  });

  logger.debug({ total: jobTypes.totalCount }, "Fetched job types from ServiceTitan");

  if (!jobTypes.data || !Array.isArray(jobTypes.data)) {
    logger.warn("No job types returned or data is not an array");
    return [];
  }

  // Filter by business unit
  const filtered = jobTypes.data.filter((jobType) =>
    jobType.businessUnitIds.includes(config.serviceTitan.businessUnitId)
  );

  logger.info({ count: filtered.length }, "Filtered job types by business unit");

  return filtered;
}