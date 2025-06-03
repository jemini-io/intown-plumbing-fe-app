import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { createJobAppointmentHandler } from "@/app/api/services/handler";
import { BookRequest, ErrorResponse } from "@/app/(routes)/video-consultation-form/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as BookRequest;

    if (!body.name || !body.email || !body.phone || !body.startTime || !body.endTime || !body.technicianId) {
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
        technicianId: body.technicianId
      }
    );

    return NextResponse.json(jobResponse);
  } catch (error) {
    console.error("Error creating job appointment:", error);
    const errorResponse: ErrorResponse = { error: "Error creating job appointment" };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
