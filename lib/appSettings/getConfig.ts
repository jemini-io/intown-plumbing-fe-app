'use server';
import { ServiceTitanConfig } from '@/lib/types/serviceTitan';
import { ServiceToJobType } from '@/lib/types/serviceToJobType';
import { StripeConfig } from '@/lib/types/stripe';
import { CustomFields } from '@/lib/types/customFields';
import { getSetting } from "@/lib/appSettings/getSetting";
import pino from "pino";


// const logger = pino({ name: 'getAvailableTimeSlots' });
const logger = pino({ name: 'getConfig' });

export async function getServiceToJobTypes(): Promise<ServiceToJobType[]> {
  const serviceToJobTypes = await getSetting('serviceToJobTypes');

  if (serviceToJobTypes === null) {
    logger.error('serviceToJobTypes setting is null');
    return [];
  }

  try {
    return JSON.parse(serviceToJobTypes);
  } catch (error) {
    logger.error({ error }, 'Failed to parse serviceToJobTypes');
    return [];
  }
}

export async function getAppointmentDuration(): Promise<number> {
  const appointmentDuration = await getSetting('appointmentDurationInMs');
  return Number(appointmentDuration);
}

export async function getPodiumLocationId(): Promise<string> {
  const podiumLocationId = await getSetting('podium.locationId');
  if (podiumLocationId === null) {
    logger.error('podium.locationId setting is null');
    throw new Error('Podium location ID is not set');
  }
  return podiumLocationId;
}

export async function getServiceTitanConfig(): Promise<ServiceTitanConfig> {
  const businessUnitId = await getSetting('serviceTitan.businessUnitId');
  const campaignId = await getSetting('serviceTitan.campaignId');
  const virtualServiceSkuId = await getSetting('serviceTitan.virtualServiceSkuId');
  const stripePaymentTypeId = await getSetting('serviceTitan.stripePaymentTypeId');

  if (!businessUnitId || !campaignId || !virtualServiceSkuId || !stripePaymentTypeId) {
    logger.error('One or more ServiceTitan config values are missing');
    throw new Error('Missing ServiceTitan configuration');
  }

  return {
    businessUnitId: Number(businessUnitId),
    campaignId,
    virtualServiceSkuId: Number(virtualServiceSkuId),
    stripePaymentTypeId: Number(stripePaymentTypeId),
  };
}

export async function getStripeConfig(): Promise<StripeConfig> {
  const virtualConsultationProductName = await getSetting('stripe.virtualConsultationProductName');

  if (!virtualConsultationProductName) {
    logger.error('stripe.virtualConsultationProductName setting is null');
    throw new Error('Stripe virtual consultation product name is not set');
  }

  return {
    virtualConsultationProductName,
  };
}

export async function getCustomFields(): Promise<CustomFields> {
  const customerJoinLink = await getSetting('customFields.customerJoinLink');
  const technicianJoinLink = await getSetting('customFields.technicianJoinLink');

  if (!customerJoinLink || !technicianJoinLink) {
    logger.error('One or more custom fields are missing');
    throw new Error('Missing custom fields configuration');
  }

  return {
    customerJoinLink: Number(customerJoinLink),
    technicianJoinLink: Number(technicianJoinLink),
  };
}

export async function getQuoteSkills(): Promise<String[]> {
  const quoteSkills = await getSetting('quoteSkills');
  
  if (quoteSkills === null) {
    logger.error('quoteSkills setting is null');
    return [];
  }

  try {
    return JSON.parse(quoteSkills);
  } catch (error) {
    logger.error({ error }, 'Failed to parse quoteSkills');
    return [];
  }
}

export async function getDefaultManagedTechId(): Promise<number> {
  const defaultManagedTechId = await getSetting('defaultManagedTechId');

  if (defaultManagedTechId === null) {
    logger.error('defaultManagedTechId setting is null');
    throw new Error('Default managed technician ID is not set');
  }

  return Number(defaultManagedTechId);
}

export async function getTechnicianToSkills(): Promise<any[]> {
  const technicianToSkills = await getSetting('technicianToSkills');

  if (technicianToSkills === null) {
    logger.error('technicianToSkills setting is null');
    return [];
  }

  try {
    return JSON.parse(technicianToSkills);
  } catch (error) {
    logger.error({ error }, 'Failed to parse technicianToSkills');
    return [];
  }
}