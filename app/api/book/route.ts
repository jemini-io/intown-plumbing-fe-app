import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { BookRequest, BookResponse, ErrorResponse } from "@/app/(routes)/video-consultation-form/types";
import { env } from "@/lib/config/env";
import { getAvailableTimeSlots } from "@/app/api/services/handler";

// Initialize Stripe with your secret key
const stripe = new Stripe(env.stripe.secretKey);

// TODO: this does not actually create the booking, it just creates a Stripe session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as BookRequest;
    
    if (!body.startTime || !body.endTime) {
      const errorResponse: ErrorResponse = { error: "Missing appointment time" };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: env.stripe.priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
      metadata: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        type: "emergency_consultation",
        start_time: body.startTime,
        end_time: body.endTime,
      },
      customer_email: body.email,
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
    });

    if (!session.url) {
      const errorResponse: ErrorResponse = { error: "Error creating payment session" };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const response: BookResponse = { sessionUrl: session.url };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error creating Stripe session or scheduling appointment:", error);
    const errorResponse: ErrorResponse = { error: "Error creating payment session or scheduling appointment" };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Get available time slots by technicians
export async function GET(req: NextRequest) {
  try {
    const availableTimeSlots = await getAvailableTimeSlots();

    return NextResponse.json(availableTimeSlots);
  } catch (error) {
    console.error("Error fetching available time slots:", error);
    return NextResponse.json({ error: "Error fetching available time slots" }, { status: 500 });
  }
}
