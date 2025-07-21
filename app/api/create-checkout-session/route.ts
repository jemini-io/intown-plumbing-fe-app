import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { env } from "@/lib/config/env";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { getProductDetails } from "@/lib/stripe/product-lookup";
import { config } from "@/lib/config";
import pino from "pino";

const logger = pino();

const stripe = new Stripe(env.stripe.secretKey);

export async function POST(req: NextRequest) {
  try {
    logger.info("POST /create-checkout-session called");

    const body = await req.json();
    const { metadata } = body;

    logger.info({ metadata }, "Metadata received");

    // Get product details
    const productDetails = await getProductDetails(config.stripe.virtualConsultationProductName);

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card"],
      line_items: [{ price: productDetails.stripePriceId, quantity: 1 }],
      mode: "payment",
      redirect_on_completion: "never",
      metadata: {
        ...metadata,
        productId: productDetails.stripeProductId,
        priceId: productDetails.stripePriceId,
        amount: productDetails.stripePrice.toString(),
      },
    });

    logger.info({ clientSecret: session.client_secret }, "Checkout session created");

    return NextResponse.json({ 
      clientSecret: session.client_secret,
      productDetails, // Include this for the frontend if needed
    });
  } catch (error) {
    logger.error({ err: error }, "Error creating checkout session");

    return handleApiError(error, {
      message: "Error creating checkout session",
      logPrefix: "[Embedded Checkout API]",
    });
  }
}
