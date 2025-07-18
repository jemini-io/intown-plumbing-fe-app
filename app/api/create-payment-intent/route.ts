import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { env } from "@/lib/config/env";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { getProductDetails } from "@/lib/stripe/product-lookup";
import { config } from "@/lib/config";

const stripe = new Stripe(env.stripe.secretKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { metadata } = body;
    const productDetails = await getProductDetails(config.stripe.virtualConsultationProductName);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: productDetails.stripePrice * 100,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        ...metadata,
        productId: productDetails.stripeProductId,
        priceId: productDetails.stripePriceId,
        amount: productDetails.stripePrice.toString(),
      },
    });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret, productDetails });
  } catch (error) {
    return handleApiError(error, {
      message: "Error creating payment intent",
      logPrefix: "[Payment Intent API]",
    });
  }
} 