'use server';
import { ServiceTitanConfig } from '@/lib/types/serviceTitan';
// import { ServiceToJobTypeMapping, TechnicianToSkillsMapping } from '../config/types';
import { StripeConfig } from '@/lib/types/stripe';
import { CustomFields } from '@/lib/types/customFields';
import { AppSettingRepository } from "./AppSettingRepository";
import pino from "pino";


const logger = pino({ name: 'getConfig' });

export async function getAppointmentDuration(): Promise<number> {
  const prompt = 'getAppointmentDuration function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking AppSettingRepository.findByKey with key: 'appointmentDurationInMs'...`);
  // const appointmentDuration = await getAppSettingByKey('appointmentDurationInMs');
  const appointmentDuration = await AppSettingRepository.findByKey('appointmentDurationInMs');
  if (!appointmentDuration) {
    logger.error('appointmentDurationInMs setting not found. Throwing error to the caller.');
    throw new Error('appointmentDurationInMs setting not found');
  }
  logger.info(`${prompt} Returning the AppointmentDurationInMs' to the caller.`);
  logger.debug({ appointmentDuration }, "Appointment DurationInMs");
  logger.info(`${prompt} Returning ${appointmentDuration} to the caller.`);
  return Number(appointmentDuration.value);
}

export async function getPodiumLocationId(): Promise<string> {
  const prompt = 'getPodiumLocationId function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking AppSettingRepository.findByKey with key: 'podium.locationId'...`);
  // const podiumLocationId = await getAppSettingByKey('podium.locationId');
  const podiumLocationId = await AppSettingRepository.findByKey('podium.locationId');
  logger.info(`${prompt} Fetched podium location ID from AppSettingRepository.findByKey with key: 'podium.locationId'...`);
  logger.debug({ podiumLocationId }, "Podium Location ID");
  
  if (podiumLocationId === null) {
    logger.error('podium.locationId setting not found. Throwing error to the caller.');
    throw new Error('podium.locationId setting not found');
  }
  logger.info(`${prompt} Returning the PodiumLocationId' to the caller.`);
  logger.debug({ podiumLocationId }, "Podium Location ID");
  logger.info(`${prompt} Returning ${podiumLocationId.value} to the caller.`);
  return podiumLocationId.value;
}

export async function getServiceTitanConfig(): Promise<ServiceTitanConfig> {
  const prompt = 'getServiceTitanConfig function says:';
  logger.info(`${prompt} Starting...`);

  logger.info(`${prompt} Invoking AppSettingRepository.findByKey with key: 'serviceTitan.businessUnitId'...`);
  const businessUnitId = await AppSettingRepository.findByKey('serviceTitan.businessUnitId');
  if (!businessUnitId) {
    logger.error('serviceTitan.businessUnitId setting not found. Throwing error to the caller.');
    throw new Error('serviceTitan.businessUnitId setting not found');
  } else {
    logger.info(`${prompt} Returning the BusinessUnitId' to the caller.`);
    logger.debug({ businessUnitId }, "Business Unit ID");
    logger.info(`${prompt} Returning ${businessUnitId.value} to the caller.`);
  }

  logger.info(`${prompt} Invoking AppSettingRepository.findByKey with key: 'serviceTitan.campaignId'...`);
  const campaignId = await AppSettingRepository.findByKey('serviceTitan.campaignId');
  if (!campaignId) {
    logger.error('serviceTitan.campaignId setting not found. Throwing error to the caller.');
    throw new Error('serviceTitan.campaignId setting not found');
  } else {
    logger.info(`${prompt} Returning the CampaignId' to the caller.`);
    logger.debug({ campaignId }, "Campaign ID");
    logger.info(`${prompt} Returning ${campaignId.value} to the caller.`);
  }

  logger.info(`${prompt} Invoking AppSettingRepository.findByKey with key: 'serviceTitan.virtualServiceSkuId'...`);
  const virtualServiceSkuId = await AppSettingRepository.findByKey('serviceTitan.virtualServiceSkuId');
  if (!virtualServiceSkuId) {
    logger.error('serviceTitan.virtualServiceSkuId setting not found. Throwing error to the caller.');
    throw new Error('serviceTitan.virtualServiceSkuId setting not found');
  } else {
    logger.info(`${prompt} Returning the VirtualServiceSkuId' to the caller.`);
    logger.debug({ virtualServiceSkuId }, "Virtual Service SKU ID");
    logger.info(`${prompt} Returning ${virtualServiceSkuId.value} to the caller.`);
  }

  logger.info(`${prompt} Invoking AppSettingRepository.findByKey with key: 'serviceTitan.stripePaymentTypeId'...`);
  const stripePaymentTypeId = await AppSettingRepository.findByKey('serviceTitan.stripePaymentTypeId');
  if (!stripePaymentTypeId) {
    logger.error('serviceTitan.stripePaymentTypeId setting not found. Returning null for stripePaymentTypeId to the caller.');
  } else {
    logger.info(`${prompt} Returning the StripePaymentTypeId' to the caller.`);
    logger.debug({ stripePaymentTypeId }, "Stripe Payment Type ID");
    logger.info(`${prompt} Returning ${stripePaymentTypeId.value} to the caller.`);
  }

  logger.info(`${prompt} Returning currentServiceTitan config to the caller.`);
  return {
    businessUnitId: Number(businessUnitId?.value),
    campaignId: campaignId?.value ?? '',
    virtualServiceSkuId: Number(virtualServiceSkuId?.value),
    stripePaymentTypeId: Number(stripePaymentTypeId?.value),
  };
}

export async function getStripeConfig(): Promise<StripeConfig> {
  const prompt = 'getStripeConfig function says:';
  logger.info(`${prompt} Starting...`);

  logger.info(`${prompt} Invoking AppSettingRepository.findByKey with key: 'stripe.virtualConsultationProductName'...`);
  const virtualConsultationProductName = await AppSettingRepository.findByKey('stripe.virtualConsultationProductName');
  logger.info(`${prompt} Fetched virtual consultation product name from AppSettingRepository.findByKey with key: 'stripe.virtualConsultationProductName'...`);
  
  if (!virtualConsultationProductName) {
    logger.error('stripe.virtualConsultationProductName setting not found. Throwing error to the caller.');
    throw new Error('Stripe virtual consultation product name is not set');
  } else if (virtualConsultationProductName.value === null) {
    logger.error('stripe.virtualConsultationProductName setting is null. Throwing error to the caller.');
    throw new Error('Stripe virtual consultation product name is null');
  } else {
    logger.info(`${prompt} Returning the VirtualConsultationProductName' to the caller.`);
    logger.debug({ virtualConsultationProductName }, "Virtual Consultation Product Name");
    logger.info(`${prompt} Returning ${virtualConsultationProductName.value} to the caller.`);
  }

  return {
    virtualConsultationProductName: virtualConsultationProductName.value,
  };
}

export async function getCustomFields(): Promise<CustomFields> {
  const prompt = 'getCustomFields function says:';
  logger.info(`${prompt} Starting...`);

  logger.info(`${prompt} Invoking AppSettingRepository.findByKey with key: 'customFields.customerJoinLink'...`);
  const customerJoinLink = await AppSettingRepository.findByKey('customFields.customerJoinLink');
  logger.info(`${prompt} Invocation of AppSettingRepository.findByKey function successfully completed for key: 'customFields.customerJoinLink'...`);

  if (!customerJoinLink) {
    logger.error('customFields.customerJoinLink setting not set. Throwing error to the caller.');
    throw new Error('customFields.customerJoinLink setting not set');
  } else if (customerJoinLink.value === null) {
    logger.error('customFields.customerJoinLink setting is null. Throwing error to the caller.');
    throw new Error('customFields.customerJoinLink setting is null');
  }

  logger.info(`${prompt} Invoking AppSettingRepository.findByKey with key: 'customFields.technicianJoinLink'...`);
  const technicianJoinLink = await AppSettingRepository.findByKey('customFields.technicianJoinLink');
  logger.info(`${prompt} Invocation of AppSettingRepository.findByKey function successfully completed for key: 'customFields.technicianJoinLink'...`);

  if (!technicianJoinLink) {
    logger.error('customFields.technicianJoinLink setting not set. Throwing error to the caller.');
    throw new Error('customFields.technicianJoinLink setting not set');
  } else if (technicianJoinLink.value === null) {
    logger.error('customFields.technicianJoinLink setting is null. Throwing error to the caller.');
    throw new Error('customFields.technicianJoinLink setting is null');
  }

  logger.info(`${prompt} Returning the CustomerJoinLink and TechnicianJoinLink to the caller.`);
  logger.debug({ customerJoinLink, technicianJoinLink }, "Customer and Technician Join Links");

  logger.info(`${prompt} Returning current custom fields configuration to the caller.`);
  return {
    customerJoinLink: Number(customerJoinLink.value),
    technicianJoinLink: Number(technicianJoinLink.value),
  };
}

export async function getDefaultManagedTechId(): Promise<number> {
  const prompt = 'getDefaultManagedTechId function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking AppSettingRepository.findByKey with key: 'defaultManagedTechId'...`);
  const defaultManagedTechId = await AppSettingRepository.findByKey('defaultManagedTechId');
  logger.info(`${prompt} Invocation of AppSettingRepository.findByKey function successfully completed for key: 'defaultManagedTechId'...`);

  if (defaultManagedTechId === null) {
    logger.error(`${prompt} defaultManagedTechId setting not found. Throwing error to the caller.`);
    throw new Error('defaultManagedTechId setting not found');
  } else if (defaultManagedTechId.value === null) {
    logger.error(`${prompt} defaultManagedTechId setting is null. Throwing error to the caller.`);
    throw new Error('defaultManagedTechId setting is null');
  }

  logger.info(`${prompt} Returning the DefaultManagedTechId' to the caller.`);
  logger.debug({ defaultManagedTechId }, `${prompt} Default Managed Tech ID`);
  logger.info(`${prompt} Returning ${defaultManagedTechId.value} to the caller.`);
  return Number(defaultManagedTechId.value);
}

export type AdminAuditData = {
  phone?: {
    number: string;
    enabled: boolean;
  };
  email?: {
    address: string;
    enabled: boolean;
  };
};

type AdminAuditDataRaw = Array<
  | { phoneNumber: string; enabled: boolean }
  | { emailAddress: string; enabled: boolean }
>;

export async function getAdminAuditData(): Promise<AdminAuditData> {
  const prompt = 'getAdminAuditData function says:';
  logger.info(`${prompt} Starting...`);
  
  try {
    logger.info(`${prompt} Invoking AppSettingRepository.findByKey with key: 'adminAuditData'...`);
    const adminAuditData = await AppSettingRepository.findByKey('adminAuditData');
    logger.info(`${prompt} Invocation of AppSettingRepository.findByKey function successfully completed for key: 'adminAuditData'...`);
    
    if (!adminAuditData) {
      logger.info(`${prompt} adminAuditData setting not set. Throwing error to the caller.`);
      throw new Error('adminAuditData setting not set');
    }

    logger.info(`${prompt} Parsing adminAuditData JSON as Array of phoneNumber or emailAddress objects...`);
    const parsedAdminAuditData = JSON.parse(adminAuditData.value) as AdminAuditDataRaw;
    logger.info({ parsedAdminAuditData }, `${prompt} adminAuditData successfully parsed.`);
    
    if (!Array.isArray(parsedAdminAuditData) || parsedAdminAuditData.length === 0) {
      logger.info(`${prompt} adminAuditData array is empty. Throwing error to the caller.`);
      throw new Error('adminAuditData array is empty');
    }

    // Transform array format to object format
    const result: AdminAuditData = {};
    
    for (const data of parsedAdminAuditData) {
      if ('phoneNumber' in data) {
        result.phone = {
          number: data.phoneNumber,
          enabled: data.enabled,
        };
      } else if ('emailAddress' in data) {
        result.email = {
          address: data.emailAddress,
          enabled: data.enabled,
        };
      }
    }
    
    logger.info(`${prompt} Returning admin audit data to the caller.`);
    logger.debug({ adminAuditData: result }, "Admin Audit Data");
    
    return result;

  } catch (error) {
    logger.error(
      { err: error },
      `${prompt} Failed to parse adminAuditData. Returning null.`
    );
    throw new Error('Failed to parse adminAuditData');
  }
}

export async function isAdminAuditPhoneEnabled(): Promise<boolean> {
  const prompt = 'isAdminAuditPhoneEnabled function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking getAdminAuditData function...`);
  const data = await getAdminAuditData();
  logger.info(`${prompt} getAdminAuditData function successfully completed...`);
  logger.debug({ data }, `${prompt} Admin Audit Data`);
  logger.info(`${prompt} Returning ${data?.phone?.enabled === true} to the caller.`);
  return data?.phone?.enabled === true;
}

export async function getAdminAuditPhoneNumber(): Promise<string | null> {
  const prompt = 'getAdminAuditPhoneNumber function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking getAdminAuditData function...`);
  const data = await getAdminAuditData();
  logger.info(`${prompt} Invocation of getAdminAuditData function successfully completed...`);

  if (!data || !data.phone) {
    logger.info(`${prompt} Admin audit phone number data not found. Throwing error to the caller.`);
    throw new Error('Admin audit phone number data not found');
  }
  else if (data.phone?.enabled === false) {
    logger.info(`${prompt} Phone notifications by phone number are disabled. Throwing error to the caller.`);
    throw new Error('Phone notifications by phone number are disabled');
  } else if (!data.phone.number) {
    logger.info(`${prompt} Phone number is null. Throwing error to the caller.`);
    throw new Error('Phone number is null');
  }

  logger.debug({ phone: data.phone }, `${prompt} Admin Audit Phone Number Data`);
  logger.info(`${prompt} Returning ${data?.phone?.number} to the caller.`);
  
  return data.phone.number;
}
