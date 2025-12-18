import { NextResponse, NextRequest } from "next/server";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { validatePromoCode } from "@/lib/repositories/appSettings/getConfig";
import { getProductDetails } from "@/lib/stripe/product-lookup";
import { getStripeConfig } from "@/lib/repositories/appSettings/getConfig";
import pino from "pino";

const logger = pino({ name: "validate-promo-code" });

export async function POST(req: NextRequest) {
  try {
    logger.info("POST /validate-promo-code called");

    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Promo code is required" },
        { status: 400 }
      );
    }

    // Get the original price from Stripe
    const stripeConfig = await getStripeConfig();
    const productDetails = await getProductDetails(stripeConfig.virtualConsultationProductName);
    const originalPrice = productDetails.stripePrice;

    logger.info({ code, originalPrice }, "Validating promo code");

    const result = await validatePromoCode(code, originalPrice);

    logger.info({ result }, "Promo code validation result");

    return NextResponse.json({
      ...result,
      originalPrice,
    });
  } catch (error) {
    logger.error({ err: error }, "Error validating promo code");

    return handleApiError(error, {
      message: "Error validating promo code",
      logPrefix: "[Validate Promo Code API]",
    });
  }
}

