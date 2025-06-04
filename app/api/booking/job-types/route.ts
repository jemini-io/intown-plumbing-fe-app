import { NextResponse } from "next/server";
import { getJobTypesByBusinessUnit } from "@/app/api/booking/job-types/getJobTypes";

export async function GET() {
  try {
    const jobTypes = await getJobTypesByBusinessUnit();
    return NextResponse.json(jobTypes);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch job types" },
      { status: 500 }
    );
  }
}
