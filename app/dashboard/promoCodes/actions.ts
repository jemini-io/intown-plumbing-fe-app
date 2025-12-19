"use server";

import { PromoCode } from "@/lib/types/promoCode";
import { PromoCodeRepository } from "@/lib/repositories";
import pino from "pino";

const logger = pino({ name: "promo-codes-actions" });

/**
 * Server Actions for PromoCode
 * These actions use the Repository pattern for database access
 * and add logging/validation/business logic as needed
 */

export async function getAllPromoCodes() {
  const prompt = "getAllPromoCodes function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking PromoCodeRepository.findAll function...`);
  const promoCodes = await PromoCodeRepository.findAll();
  logger.info(`${prompt} Invocation of PromoCodeRepository.findAll function successfully completed.`);
  logger.info(`${prompt} Returning array of ${promoCodes.length} promo codes to the caller.`);
  return promoCodes;
}

export async function getAllEnabledPromoCodes() {
  const prompt = "getAllEnabledPromoCodes function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking PromoCodeRepository.findAllEnabled function...`);
  const promoCodes = await PromoCodeRepository.findAllEnabled();
  logger.info(`${prompt} Invocation of PromoCodeRepository.findAllEnabled function successfully completed.`);
  logger.info(`${prompt} Returning array of ${promoCodes.length} enabled promo codes to the caller.`);
  return promoCodes;
}

export async function findPromoCodeById(id: string) {
  const prompt = "findPromoCodeById function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking PromoCodeRepository.findById function with ID: ${id}`);
  const promoCode = await PromoCodeRepository.findById(id);
  logger.info(`${prompt} Invocation of PromoCodeRepository.findById function successfully completed.`);
  logger.info(`${prompt} PromoCode found with ID: ${promoCode?.id}`);
  return promoCode;
}

export async function findPromoCodeByCode(code: string) {
  const prompt = "findPromoCodeByCode function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking PromoCodeRepository.findByCode function with code: ${code}`);
  const promoCode = await PromoCodeRepository.findByCode(code);
  logger.info(`${prompt} Invocation of PromoCodeRepository.findByCode function successfully completed.`);
  logger.info(`${prompt} PromoCode found: ${promoCode?.code}`);
  return promoCode;
}

export async function addPromoCode(
  data: Omit<PromoCode, "id" | "usageCount" | "createdAt" | "updatedAt" | "image">
) {
  const prompt = "addPromoCode function says:";
  logger.info(`${prompt} Starting...`);
  logger.info({ data }, `${prompt} Invoking PromoCodeRepository.create function with data:`);
  const createdPromoCode = await PromoCodeRepository.create(data);
  logger.info(`${prompt} Invocation of PromoCodeRepository.create function successfully completed.`);
  logger.info(`${prompt} PromoCode created with ID: ${createdPromoCode.id}`);
  return createdPromoCode;
}

export async function updatePromoCode(
  id: string,
  data: Partial<Omit<PromoCode, "id" | "createdAt" | "updatedAt" | "image">>
) {
  const prompt = "updatePromoCode function says:";
  logger.info(`${prompt} Starting...`);
  logger.info({ data }, `${prompt} Invoking PromoCodeRepository.update function with data:`);
  const updatedPromoCode = await PromoCodeRepository.update(id, data);
  logger.info(`${prompt} Invocation of PromoCodeRepository.update function successfully completed.`);
  logger.info(`${prompt} PromoCode updated with ID: ${updatedPromoCode.id}`);
  return updatedPromoCode;
}

export async function deletePromoCode(id: string) {
  const prompt = "deletePromoCode function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking PromoCodeRepository.delete function with ID: ${id}...`);
  const deletedPromoCode = await PromoCodeRepository.delete(id);
  logger.info(`${prompt} Invocation of PromoCodeRepository.delete function successfully completed.`);
  logger.info(`${prompt} PromoCode with ID: ${deletedPromoCode.id} successfully deleted.`);
  return deletedPromoCode;
}

export async function incrementPromoCodeUsage(id: string) {
  const prompt = "incrementPromoCodeUsage function says:";
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking PromoCodeRepository.incrementUsage function with ID: ${id}...`);
  const promoCode = await PromoCodeRepository.incrementUsage(id);
  logger.info(`${prompt} Invocation of PromoCodeRepository.incrementUsage function successfully completed.`);
  logger.info(`${prompt} PromoCode ${promoCode.code} usage count incremented to ${promoCode.usageCount}.`);
  return promoCode;
}

export async function validatePromoCode(code: string, originalPrice: number) {
  const prompt = "validatePromoCode function says:";
  logger.info(`${prompt} Starting validation for code: ${code}...`);
  const result = await PromoCodeRepository.validateAndCalculate(code, originalPrice);
  logger.info(`${prompt} Validation completed. Valid: ${result.valid}`);
  return result;
}

