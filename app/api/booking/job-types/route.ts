import { getJobTypesByServiceTitanIds } from "@/app/api/booking/job-types/getJobTypes";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const jobTypes = await getJobTypesByServiceTitanIds();
    return NextResponse.json(jobTypes);
  } catch (err) {
    return handleApiError(err, {
      message: "Failed to fetch job types",
      logPrefix: "[Job Types API]"
    });
  }
}
