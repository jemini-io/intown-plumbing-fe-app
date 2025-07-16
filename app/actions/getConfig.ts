'use server';

import { config } from '@/lib/config';

export async function getServiceTypes() {
  return config.serviceToJobTypes;
}

export async function getAppointmentDuration() {
  return config.appointmentDurationInMs;
}

export async function getPodiumLocationId() {
  return config.podium.locationId;
}

export async function getServiceTitanConfig() {
  return {
    virtualServiceSkuId: config.serviceTitan.virtualServiceSkuId,
    businessUnitId: config.serviceTitan.businessUnitId,
    campaignId: config.serviceTitan.campaignId,
    stripePaymentTypeId: config.serviceTitan.stripePaymentTypeId,
  };
}

export async function getStripeConfig() {
  return {
    virtualConsultationProductName: config.stripe.virtualConsultationProductName,
  };
}

export async function getCustomFields() {
  return config.customFields;
} 