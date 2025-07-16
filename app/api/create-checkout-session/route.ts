import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { env } from "@/lib/config/env";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { STRIPE_VIRTUAL_CONSULTATION_PRODUCT_NAME } from "@/lib/utils/constants";
import { getProductDetails } from "@/lib/stripe/product-lookup";

const stripe = new Stripe(env.stripe.secretKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { metadata } = body;

    // Get product details
    const productDetails = await getProductDetails(STRIPE_VIRTUAL_CONSULTATION_PRODUCT_NAME);

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

    return NextResponse.json({ 
      clientSecret: session.client_secret,
      productDetails, // Include this for the frontend if needed
    });
  } catch (error) {
    return handleApiError(error, {
      message: "Error creating checkout session",
      logPrefix: "[Embedded Checkout API]",
    });
  }
}
