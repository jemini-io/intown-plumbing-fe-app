import { getJobTypesByServiceTitanIds } from "@/app/api/booking/job-types/getJobTypes";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { NextResponse } from "next/server";
import pino from "pino";

const logger = pino();

export async function GET() {
  try {
    logger.info("GET /booking/job-types called");

    const jobTypes = await getJobTypesByServiceTitanIds();
    // logger.info({ jobTypes }, "Job types fetched successfully");
    logger.info({ jobTypesCount: jobTypes.length }, "Fetched job types count");

    return NextResponse.json(jobTypes);
  } catch (err) {
    logger.error({ err }, "Failed to fetch job types");

    return handleApiError(err, {
      message: "Failed to fetch job types",
      logPrefix: "[Job Types API]"
    });
  }
}
