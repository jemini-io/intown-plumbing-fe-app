'use server';
import { ServiceTitanConfig } from '@/lib/types/serviceTitan';
// import { ServiceToJobTypeMapping, TechnicianToSkillsMapping } from '../config/types';
import { StripeConfig } from '@/lib/types/stripe';
import { CustomFields } from '@/lib/types/customFields';
import { getAppSettingByKey } from "@/lib/appSettings/getSetting";
import pino from "pino";


const logger = pino({ name: 'getConfig' });

export async function getAppointmentDuration(): Promise<number> {
  const prompt = 'getAppointmentDuration function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking getAppSettingByKey with key: 'appointmentDurationInMs'...`);
  const appointmentDuration = await getAppSettingByKey('appointmentDurationInMs');
  logger.info(`${prompt} Fetched appointment duration from getAppSettingByKey with key: 'appointmentDurationInMs'...`);
  logger.debug({ appointmentDuration }, "Appointment Duration");
  logger.info(`${prompt} Returning ${appointmentDuration} to the caller.`);
  return Number(appointmentDuration);
}

export async function getPodiumLocationId(): Promise<string> {
  const prompt = 'getPodiumLocationId function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking getAppSettingByKey with key: 'podium.locationId'...`);
  const podiumLocationId = await getAppSettingByKey('podium.locationId');
  logger.info(`${prompt} Fetched podium location ID from getAppSettingByKey with key: 'podium.locationId'...`);
  logger.debug({ podiumLocationId }, "Podium Location ID");
  
  if (podiumLocationId === null) {
    logger.error('podium.locationId setting is null');
    throw new Error('Podium location ID is not set');
  }
  
  logger.info(`${prompt} Returning ${podiumLocationId} to the caller.`);
  return podiumLocationId;
}

export async function getServiceTitanConfig(): Promise<ServiceTitanConfig> {
  const prompt = 'getServiceTitanConfig function says:';
  logger.info(`${prompt} Starting...`);
  const businessUnitId = await getAppSettingByKey('serviceTitan.businessUnitId');
  const campaignId = await getAppSettingByKey('serviceTitan.campaignId');
  const virtualServiceSkuId = await getAppSettingByKey('serviceTitan.virtualServiceSkuId');
  const stripePaymentTypeId = await getAppSettingByKey('serviceTitan.stripePaymentTypeId');

  if (!businessUnitId || !campaignId || !virtualServiceSkuId || !stripePaymentTypeId) {
    logger.error('One or more ServiceTitan config values are missing');
    throw new Error('Missing ServiceTitan configuration');
  }

  logger.info(`${prompt} Returning ServiceTitan config to the caller.`);
  return {
    businessUnitId: Number(businessUnitId),
    campaignId,
    virtualServiceSkuId: Number(virtualServiceSkuId),
    stripePaymentTypeId: Number(stripePaymentTypeId),
  };
}

export async function getStripeConfig(): Promise<StripeConfig> {
  const virtualConsultationProductName = await getAppSettingByKey('stripe.virtualConsultationProductName');

  if (!virtualConsultationProductName) {
    logger.error('stripe.virtualConsultationProductName setting is null');
    throw new Error('Stripe virtual consultation product name is not set');
  }

  return {
    virtualConsultationProductName,
  };
}

export async function getCustomFields(): Promise<CustomFields> {
  const customerJoinLink = await getAppSettingByKey('customFields.customerJoinLink');
  const technicianJoinLink = await getAppSettingByKey('customFields.technicianJoinLink');

  if (!customerJoinLink || !technicianJoinLink) {
    logger.error('One or more custom fields are missing');
    throw new Error('Missing custom fields configuration');
  }

  return {
    customerJoinLink: Number(customerJoinLink),
    technicianJoinLink: Number(technicianJoinLink),
  };
}

export async function getDefaultManagedTechId(): Promise<number> {
  const defaultManagedTechId = await getAppSettingByKey('defaultManagedTechId');

  if (defaultManagedTechId === null) {
    logger.error('defaultManagedTechId setting is null');
    throw new Error('Default managed technician ID is not set');
  }

  return Number(defaultManagedTechId);
}
