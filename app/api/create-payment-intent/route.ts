import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { env } from "@/lib/config/env";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { getProductDetails } from "@/lib/stripe/product-lookup";
import { getStripeConfig } from "@/lib/repositories/appSettings/getConfig"
import pino from "pino";

const logger = pino();

const stripe = new Stripe(env.stripe.secretKey);

export async function POST(req: NextRequest) {
  try {
    logger.info("POST /create-payment-intent called");

    const body = await req.json();
    const { metadata, amount } = body;
    logger.info({ metadata, amount }, "Metadata and amount received");

    const stripeConfig = await getStripeConfig();
    
    const productDetails = await getProductDetails(stripeConfig.virtualConsultationProductName);
    logger.info({ productDetails }, "Product details fetched");

    // Use provided amount (with discount) or default to original price
    const finalAmount = amount !== undefined ? amount : productDetails.stripePrice;
    const amountInCents = Math.round(finalAmount * 100);

    logger.info({ finalAmount, amountInCents }, "Using amount for payment intent");

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        ...metadata,
        productId: productDetails.stripeProductId,
        priceId: productDetails.stripePriceId,
        amount: finalAmount.toString(),
        originalAmount: productDetails.stripePrice.toString(),
      },
    });

    logger.info({ clientSecret: paymentIntent.client_secret }, "Payment intent created");

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret, 
      productDetails: {
        ...productDetails,
        stripePrice: finalAmount, // Return the actual amount being charged
      }
    });
  } catch (error) {
    logger.error({ err: error }, "Error creating payment intent");

    return handleApiError(error, {
      message: "Error creating payment intent",
      logPrefix: "[Payment Intent API]",
    });
  }
} 