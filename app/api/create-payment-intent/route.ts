import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { env } from "@/lib/config/env";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { getProductDetails } from "@/lib/stripe/product-lookup";
import { getStripeConfig } from "@/lib/appSettings/getConfig"
import pino from "pino";

const logger = pino();

const stripe = new Stripe(env.stripe.secretKey);

export async function POST(req: NextRequest) {
  try {
    logger.info("POST /create-payment-intent called");

    const body = await req.json();
    const { metadata } = body;
    logger.info({ metadata }, "Metadata received");

    const stripeConfig = await getStripeConfig();
    
    const productDetails = await getProductDetails(stripeConfig.virtualConsultationProductName);
    logger.info({ productDetails }, "Product details fetched");

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

    logger.info({ clientSecret: paymentIntent.client_secret }, "Payment intent created");

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, productDetails });
  } catch (error) {
    logger.error({ err: error }, "Error creating payment intent");

    return handleApiError(error, {
      message: "Error creating payment intent",
      logPrefix: "[Payment Intent API]",
    });
  }
} 