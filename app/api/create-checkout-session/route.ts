import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { env } from "@/lib/config/env";
import { handleApiError } from "@/lib/utils/api-error-handler";

const stripe = new Stripe(env.stripe.secretKey);

export async function POST(req: NextRequest) {
  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card"],
      line_items: [{ price: env.stripe.priceId, quantity: 1 }],
      mode: "payment",
      redirect_on_completion: "never", // Add this line
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    return handleApiError(error, {
      message: "Error creating checkout session",
      logPrefix: "[Embedded Checkout API]",
    });
  }
}
