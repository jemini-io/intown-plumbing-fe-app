import { NextResponse } from "next/server";
import { getJobTypesByBusinessUnit } from "@/app/api/booking/job-types/getJobTypes";
import { handleApiError } from "@/lib/utils/api-error-handler";

export async function GET() {
  try {
    const jobTypes = await getJobTypesByBusinessUnit();
    return NextResponse.json(jobTypes);
  } catch (err) {
    return handleApiError(err, {
      message: "Failed to fetch job types",
      logPrefix: "[Job Types API]"
    });
  }
}
