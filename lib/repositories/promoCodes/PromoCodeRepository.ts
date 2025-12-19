/**
 * Repository for PromoCode entity
 * Encapsulates all database access for PromoCode
 */

import { prisma } from "@/lib/prisma";
import { PromoCode, PromoCodeValidationResult } from "@/lib/types/promoCode";
import { Decimal } from "@/lib/generated/prisma/runtime/library";
import pino from "pino";

const logger = pino({ name: "PromoCodeRepository" });

// Helper to convert Decimal to number
function decimalToNumber(value: Decimal | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

// Helper to map Prisma result to PromoCode type
function mapToPromoCode(promoCode: {
  id: string;
  code: string;
  type: "PERCENT" | "AMOUNT";
  value: Decimal;
  description: string | null;
  imageId: string | null;
  image?: { id: string; url: string; publicId: string } | null;
  usageLimit: number | null;
  usageCount: number;
  minPurchase: Decimal | null;
  maxDiscount: Decimal | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}): PromoCode {
  return {
    ...promoCode,
    value: Number(promoCode.value),
    minPurchase: decimalToNumber(promoCode.minPurchase),
    maxDiscount: decimalToNumber(promoCode.maxDiscount),
  };
}

export class PromoCodeRepository {
  /**
   * Get all promo codes
   */
  static async findAll(): Promise<PromoCode[]> {
    const prompt = "PromoCodeRepository.findAll function says:";
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.promoCode.findMany function...`);
    
    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
      include: { image: true },
    });

    logger.info(`${prompt} Invocation of prisma.promoCode.findMany function successfully completed.`);
    logger.info(`${prompt} Returning array of ${promoCodes.length} promo codes to the caller.`);
    
    return promoCodes.map(mapToPromoCode);
  }

  /**
   * Get all enabled promo codes
   */
  static async findAllEnabled(): Promise<PromoCode[]> {
    const prompt = "PromoCodeRepository.findAllEnabled function says:";
    logger.info(`${prompt} Starting...`);
    
    const promoCodes = await prisma.promoCode.findMany({
      where: { enabled: true },
      orderBy: { createdAt: "desc" },
      include: { image: true },
    });

    logger.info(`${prompt} Returning array of ${promoCodes.length} enabled promo codes.`);
    return promoCodes.map(mapToPromoCode);
  }

  /**
   * Get promo code by ID
   */
  static async findById(id: string): Promise<PromoCode | null> {
    const prompt = "PromoCodeRepository.findById function says:";
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.promoCode.findUnique function with ID: ${id}...`);
    
    const promoCode = await prisma.promoCode.findUnique({
      where: { id },
      include: { image: true },
    });

    logger.info(`${prompt} Invocation of prisma.promoCode.findUnique function successfully completed.`);

    if (!promoCode) {
      logger.info(`${prompt} No promo code found with ID: ${id}. Returning null.`);
      return null;
    }

    logger.info(`${prompt} Promo code found with ID: ${promoCode.id}.`);
    return mapToPromoCode(promoCode);
  }

  /**
   * Get promo code by code string
   */
  static async findByCode(code: string): Promise<PromoCode | null> {
    const prompt = "PromoCodeRepository.findByCode function says:";
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.promoCode.findUnique function with code: ${code}...`);
    
    const normalizedCode = code.trim().toUpperCase();
    
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: normalizedCode },
      include: { image: true },
    });

    logger.info(`${prompt} Invocation of prisma.promoCode.findUnique function successfully completed.`);

    if (!promoCode) {
      logger.info(`${prompt} No promo code found with code: ${code}. Returning null.`);
      return null;
    }

    logger.info(`${prompt} Promo code found: ${promoCode.code}.`);
    return mapToPromoCode(promoCode);
  }

  /**
   * Create a new promo code
   */
  static async create(
    data: Omit<PromoCode, "id" | "usageCount" | "createdAt" | "updatedAt" | "image">
  ): Promise<PromoCode> {
    const prompt = "PromoCodeRepository.create function says:";
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.promoCode.create...`);
    
    const promoCode = await prisma.promoCode.create({
      data: {
        code: data.code.trim().toUpperCase(),
        type: data.type,
        value: data.value,
        description: data.description,
        imageId: data.imageId,
        usageLimit: data.usageLimit,
        minPurchase: data.minPurchase,
        maxDiscount: data.maxDiscount,
        startsAt: data.startsAt,
        expiresAt: data.expiresAt,
        enabled: data.enabled,
      },
      include: { image: true },
    });

    logger.info(`${prompt} Promo code created with ID: ${promoCode.id}.`);
    return mapToPromoCode(promoCode);
  }

  /**
   * Update a promo code
   */
  static async update(
    id: string,
    data: Partial<Omit<PromoCode, "id" | "createdAt" | "updatedAt" | "image">>
  ): Promise<PromoCode> {
    const prompt = "PromoCodeRepository.update function says:";
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.promoCode.update with ID: ${id}...`);
    
    const updateData: Record<string, unknown> = {};
    
    if (data.code !== undefined) updateData.code = data.code.trim().toUpperCase();
    if (data.type !== undefined) updateData.type = data.type;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageId !== undefined) updateData.imageId = data.imageId;
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit;
    if (data.usageCount !== undefined) updateData.usageCount = data.usageCount;
    if (data.minPurchase !== undefined) updateData.minPurchase = data.minPurchase;
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount;
    if (data.startsAt !== undefined) updateData.startsAt = data.startsAt;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;

    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: updateData,
      include: { image: true },
    });

    logger.info(`${prompt} Promo code updated with ID: ${promoCode.id}.`);
    return mapToPromoCode(promoCode);
  }

  /**
   * Delete a promo code
   */
  static async delete(id: string): Promise<PromoCode> {
    const prompt = "PromoCodeRepository.delete function says:";
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.promoCode.delete with ID: ${id}...`);
    
    const promoCode = await prisma.promoCode.delete({
      where: { id },
      include: { image: true },
    });

    logger.info(`${prompt} Promo code deleted with ID: ${promoCode.id}.`);
    return mapToPromoCode(promoCode);
  }

  /**
   * Increment usage count
   */
  static async incrementUsage(id: string): Promise<PromoCode> {
    const prompt = "PromoCodeRepository.incrementUsage function says:";
    logger.info(`${prompt} Starting...`);
    
    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
      include: { image: true },
    });

    logger.info(`${prompt} Usage count incremented for promo code ${promoCode.code}. New count: ${promoCode.usageCount}.`);
    return mapToPromoCode(promoCode);
  }

  /**
   * Validate a promo code and calculate discount
   */
  static async validateAndCalculate(
    code: string,
    originalPrice: number
  ): Promise<PromoCodeValidationResult> {
    const prompt = "PromoCodeRepository.validateAndCalculate function says:";
    logger.info(`${prompt} Starting validation for code: ${code}...`);

    const promoCode = await this.findByCode(code);

    if (!promoCode) {
      logger.info(`${prompt} Promo code "${code}" not found.`);
      return { valid: false, error: "Invalid promo code" };
    }

    // Check if enabled
    if (!promoCode.enabled) {
      logger.info(`${prompt} Promo code "${code}" is disabled.`);
      return { valid: false, error: "This promo code is no longer active" };
    }

    // Check usage limit
    if (promoCode.usageLimit !== null && promoCode.usageCount >= promoCode.usageLimit) {
      logger.info(`${prompt} Promo code "${code}" has reached its usage limit.`);
      return { valid: false, error: "This promo code has reached its usage limit" };
    }

    // Check date validity
    const now = new Date();
    if (promoCode.startsAt && now < promoCode.startsAt) {
      logger.info(`${prompt} Promo code "${code}" is not yet valid.`);
      return { valid: false, error: "This promo code is not yet valid" };
    }
    if (promoCode.expiresAt && now > promoCode.expiresAt) {
      logger.info(`${prompt} Promo code "${code}" has expired.`);
      return { valid: false, error: "This promo code has expired" };
    }

    // Check minimum purchase
    if (promoCode.minPurchase !== null && originalPrice < promoCode.minPurchase) {
      logger.info(`${prompt} Minimum purchase not met for promo code "${code}".`);
      return {
        valid: false,
        error: `Minimum purchase of $${promoCode.minPurchase.toFixed(2)} required`,
      };
    }

    // Calculate discount
    let discountAmount: number;

    if (promoCode.type === "PERCENT") {
      // For percent type: value of 0.0 means 100% off, 0.5 means 50% off
      discountAmount = originalPrice * (1 - promoCode.value);
    } else {
      // For amount type: value is in cents (e.g., 500 = $5.00)
      discountAmount = promoCode.value / 100;
    }

    // Apply max discount cap if set
    if (promoCode.maxDiscount !== null && discountAmount > promoCode.maxDiscount) {
      discountAmount = promoCode.maxDiscount;
    }

    const finalPrice = Math.max(0, originalPrice - discountAmount);

    logger.info(
      `${prompt} Promo code "${code}" is valid. Discount: $${discountAmount.toFixed(2)}, Final price: $${finalPrice.toFixed(2)}`
    );

    return {
      valid: true,
      promoCode,
      discountAmount,
      finalPrice,
    };
  }
}

