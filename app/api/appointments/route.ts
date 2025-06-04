import { NextResponse, NextRequest } from "next/server";
import { getAvailableTimeSlots } from "../services/handler";

// Get Available Time Slots
export async function GET(req: NextRequest) {
  try {
    const availableTimeSlots = await getAvailableTimeSlots();

    return NextResponse.json(availableTimeSlots);
  } catch (error) {
    console.error("Error fetching available time slots:", error);
    return NextResponse.json(
      { error: "Error fetching available time slots" },
      { status: 500 }
    );
  }
}
