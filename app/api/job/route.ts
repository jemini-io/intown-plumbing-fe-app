import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { createJobAppointmentHandler } from "@/app/services/handler";
import { BookRequest, ErrorResponse } from "@/app/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as BookRequest;

    if (!body.name || !body.email || !body.phone || !body.startTime || !body.endTime) {
      const errorResponse: ErrorResponse = { error: "Missing required information" };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Use the handler function to manage job creation
    const jobResponse = await createJobAppointmentHandler(body.name, body.email, body.phone, body.startTime, body.endTime);

    return NextResponse.json(jobResponse);
  } catch (error) {
    console.error("Error creating job appointment:", error);
    const errorResponse: ErrorResponse = { error: "Error creating job appointment" };
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 