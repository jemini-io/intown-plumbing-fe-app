"use server";

import { ServiceTitanClient } from "@/lib/servicetitan";
import { env } from "@/lib/config/env";
import { getAllServices } from '@/app/dashboard/services/actions';
import { getServiceTitanConfig } from '@/lib/appSettings/getConfig';
import pino from "pino";

const logger = pino({ name: "getJobTypesByServiceTitanIds" });

/**
 * Get Job Types by Service Titan ID from the constants file
 */
export async function getJobTypesByServiceTitanIds() {
  const prompt = 'getJobTypesByServiceTitanIds function says:';
  logger.info(`${prompt} Starting...`);

  logger.info(`${prompt} Invoking getAllServices function...`);
  const services = await getAllServices();
  logger.info(`${prompt} Fetched ${services.length} services from getAllServices function.`);

  logger.info(`${prompt} Mapping services to unique ServiceTitan IDs`);
  const uniqueServiceTitanIds = Array.from(new Set(services.map((service) => service.serviceTitanId)));
  logger.info(`${prompt} ${uniqueServiceTitanIds.length} unique ServiceTitan IDs mapped from services.`);
  logger.debug({ uniqueServiceTitanIds }, "Unique ServiceTitan IDs");
 
  const serviceTitanClient = new ServiceTitanClient();
  // Fetch job types with the specific ID
  logger.info(`${prompt} Invoking serviceTitanClient.jpm.JobTypesService.jobTypesGetList with IDs: ${uniqueServiceTitanIds.join(',')}`);
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

  logger.info(`${prompt} Invoking getServiceTitanConfig function...`);
  const serviceTitanConfig = await getServiceTitanConfig();
  logger.info(`${prompt} Fetched serviceTitanConfig from getServiceTitanConfig function.`);
  logger.debug({ serviceTitanConfig }, "ServiceTitan Config");

  // Filter by business unit
  logger.info(`${prompt} Filtering job types by business unit: ${serviceTitanConfig.businessUnitId}`);
  const filtered = jobTypes.data.filter((jobType) => 
    jobType.businessUnitIds.includes(serviceTitanConfig.businessUnitId)
  );
  logger.info(`${prompt} ${filtered.length} job types filtered by business unit.`);
  logger.debug({ filtered }, "Filtered job types by business unit");

  logger.info(`${prompt} Returning array of ${filtered.length} job types to the caller.`);
  return filtered;
}