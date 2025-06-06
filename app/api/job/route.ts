import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { createJobAppointmentHandler } from "@/app/api/services/handler";
import { BookRequest, ErrorResponse } from "@/app/(routes)/video-consultation-form/types";
import { handleApiError } from "@/lib/utils/api-error-handler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as BookRequest;

    if (!body.name || !body.email || !body.phone || !body.startTime || !body.endTime || !body.technicianId || !body.jobTypeId) {
      const errorResponse: ErrorResponse = { error: "Missing required information" };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Use the handler function to manage job creation
    const jobResponse = await createJobAppointmentHandler(
      { 
        name: body.name, 
        email: body.email, 
        phone: body.phone, 
        startTime: body.startTime, 
        endTime: body.endTime,
        technicianId: body.technicianId,
        jobTypeId: body.jobTypeId
      }
    );

    return NextResponse.json(jobResponse);
  } catch (error) {
    return handleApiError(error, {
      message: "Error creating job appointment",
      logPrefix: "[Job API]"
    });
  }
}
