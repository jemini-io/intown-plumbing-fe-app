import Stripe from "stripe";
import { env } from "@/lib/config/env";
import pino from "pino";

const stripe = new Stripe(env.stripe.secretKey);
const logger = pino({ name: "stripe-product-lookup" });

export interface ProductDetails {
  stripeProductId: string;
  stripePriceId: string;
  stripePrice: number;
}

export async function getProductDetails(productName: string): Promise<ProductDetails> {
  // 1. Get the product
  const products = await stripe.products.list({ active: true, limit: 100 });
  const product = products.data.find(p => p.name === productName);
  if (!product) {
    logger.error(`Product "${productName}" not found in Stripe`);
    throw new Error(`Product "${productName}" not found in Stripe`);
  }
  // console.log("Product:", product);
  logger.info({ product }, `Found Stripe product "${productName}"`);

  // 2. Get the default price for the product
  const defaultPriceId = product.default_price;
  if (!defaultPriceId || typeof defaultPriceId !== "string") {
    logger.error(`No default price found for product "${productName}"`);
    throw new Error(`No default price found for product "${productName}"`);
  }
  const price = await stripe.prices.retrieve(defaultPriceId);
  if (!price || !price.unit_amount) {
    logger.error(`No active price found for product "${productName}"`);
    throw new Error(`No active price found for product "${productName}"`);
  }
  // console.log("Price:", price);
  logger.info({ price }, `Retrieved Stripe price for product "${productName}"`);

  return {
    stripeProductId: product.id,
    stripePriceId: price.id,
    stripePrice: price.unit_amount / 100, // 2550 / 100 = 25.50
  };
} 
