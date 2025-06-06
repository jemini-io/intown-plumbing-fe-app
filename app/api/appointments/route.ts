import { NextResponse, NextRequest } from "next/server";
import { getAvailableTimeSlots } from "../services/handler";
import { handleApiError } from "@/lib/utils/api-error-handler";

// Get Available Time Slots
export async function GET(req: NextRequest) {
  try {
    const availableTimeSlots = await getAvailableTimeSlots();

    return NextResponse.json(availableTimeSlots);
  } catch (error) {
    return handleApiError(error, {
      message: "Error fetching available time slots",
      logPrefix: "[Appointments API]"
    });
  }
}
