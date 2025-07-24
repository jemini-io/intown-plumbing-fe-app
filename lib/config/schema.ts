import { z } from "zod";

// Base schemas
const QuoteSkillSchema = z.enum([
  "Virtual Quote - Remodel Project",
  "Virtual Quote - Repair/Install", 
  "Virtual Quote - Water Filtration"
]);

const SupportedSkillSchema = z.enum([
  "Virtual Quote - Remodel Project",
  "Virtual Quote - Repair/Install",
  "Virtual Quote - Water Filtration",
  "Virtual Service"
]);

// Service to Job Type schema
const ServiceToJobTypeSchema = z.object({
  id: z.number(),
  displayName: z.string(),
  serviceTitanId: z.number(),
  serviceTitanName: z.string(),
  emoji: z.string(),
  description: z.string(),
  skills: z.tuple([
    z.literal("Virtual Quote - Remodel Project"),
    z.literal("Virtual Quote - Repair/Install"), 
    z.literal("Virtual Quote - Water Filtration")
  ]).optional(),
});

// Technician to Skills schema
const TechnicianToSkillsSchema = z.object({
  technicianId: z.number(),
  technicianName: z.string(),
  skills: z.array(SupportedSkillSchema),
});

// Main configuration schema
export const ConfigSchema = z.object({
  app: z.object({
    name: z.string(),
    environment: z.enum(["test", "prod"]),
  }),
  serviceTitan: z.object({
    virtualServiceSkuId: z.number(),
    businessUnitId: z.number(),
    campaignId: z.number(),
    stripePaymentTypeId: z.number(),
  }),
  podium: z.object({
    locationId: z.string(),
  }),
  stripe: z.object({
    virtualConsultationProductName: z.string(),
  }),
  serviceToJobTypes: z.array(ServiceToJobTypeSchema),
  quoteSkills: z.array(QuoteSkillSchema),
  technicianToSkills: z.array(TechnicianToSkillsSchema),
  customFields: z.object({
    customerJoinLink: z.number(),
    technicianJoinLink: z.number(),
  }),
  appointmentDurationInMs: z.number(),
});

export type Config = z.infer<typeof ConfigSchema>;
