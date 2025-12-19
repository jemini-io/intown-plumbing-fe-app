/**
 * Server-side wrapper for PromoCodeRepository
 * This file re-exports repository methods as Server Actions
 * for use in client components
 */

"use server";

import { PromoCodeRepository } from "./PromoCodeRepository";
import { PromoCode } from "@/lib/types/promoCode";

/**
 * Server Action: Get all promo codes
 */
export async function getAllPromoCodes() {
  return PromoCodeRepository.findAll();
}

/**
 * Server Action: Get all enabled promo codes
 */
export async function getAllEnabledPromoCodes() {
  return PromoCodeRepository.findAllEnabled();
}

/**
 * Server Action: Get promo code by ID
 */
export async function getPromoCodeById(id: string) {
  return PromoCodeRepository.findById(id);
}

/**
 * Server Action: Get promo code by code string
 */
export async function getPromoCodeByCode(code: string) {
  return PromoCodeRepository.findByCode(code);
}

/**
 * Server Action: Create a new promo code
 */
export async function createPromoCode(
  data: Omit<PromoCode, "id" | "usageCount" | "createdAt" | "updatedAt" | "image">
) {
  return PromoCodeRepository.create(data);
}

/**
 * Server Action: Update a promo code
 */
export async function updatePromoCode(
  id: string,
  data: Partial<Omit<PromoCode, "id" | "createdAt" | "updatedAt" | "image">>
) {
  return PromoCodeRepository.update(id, data);
}

/**
 * Server Action: Delete a promo code
 */
export async function deletePromoCode(id: string) {
  return PromoCodeRepository.delete(id);
}

/**
 * Server Action: Increment usage count
 */
export async function incrementPromoCodeUsage(id: string) {
  return PromoCodeRepository.incrementUsage(id);
}

/**
 * Server Action: Validate promo code and calculate discount
 */
export async function validatePromoCode(code: string, originalPrice: number) {
  return PromoCodeRepository.validateAndCalculate(code, originalPrice);
}

