export const THIRTY_MINUTES = 30 * 60000;

// Pricebook -> Virtual Service 1:1 Customer / Tech
export const ST_VIRTUAL_SERVICE_SKU_ID = 76811280;
// "Service" business unit
export const ST_BUSINESS_UNIT_ID = 4282891;
// "Direct Web Traffic" campaign
export const ST_CAMPAIGN_ID = 46989774;
// Service Titan Stripe Payment Type
export const ST_STRIPE_PAYMENT_TYPE_ID = 76816941;

export const PODIUM_LOCATION_ID = "ce0abd8b-af60-587f-bef5-aea4b16ccb2a";

export const STRIPE_VIRTUAL_CONSULTATION_PRODUCT_NAME = "Virtual Consultation";
export interface ServiceToJobTypeMapping {
  id: number;
  displayName: string;
  serviceTitanId: number;
  serviceTitanName: string;
  emoji: string;
  description: string; // Added description field
  skills?: typeof QUOTE_SKILLS;
}

export const QUOTE_SKILLS = [
  "Virtual Quote - Remodel",
  "Virtual Quote - Repair/Install",
  "Virtual Quote - Water Filtration"
] as const;

export type QuoteSkill = typeof QUOTE_SKILLS[number];

export const SERVICE_TO_JOB_TYPES_MAPPING: ServiceToJobTypeMapping[] = [
  {
    id: 1,
    displayName: "DIY Plumbing Consult",
    serviceTitanId: 76820749,
    serviceTitanName: "Virtual Consultation - Service Request",
    emoji: "🔧", // Wrench for Repair
    description: "Have a licensed plumber help you assess or diagnose your DIY plumbing questions.",
  },
  {
    id: 2,
    displayName: "Help! Emergency!",
    serviceTitanId: 76820749,
    serviceTitanName: "Virtual Consultation - Service Request",
    emoji: "🚨", // Siren for Emergency
    description:
      "Urgent plumbing problem? Get immediate virtual help to assess and guide you through the next steps.",
  },
  {
    id: 3,
    displayName: "Get A Quote",
    serviceTitanId: 76820748,
    serviceTitanName: "Virtual Consultation - Quote Request",
    emoji: "🧾", // Receipt for Quote
    description:
      "Schedule a virtual walkthrough to receive a quote for your plumbing project or repair.",
    skills: QUOTE_SKILLS,
  },
];

/**
 * Service Titan doesn't return the skills for technicians.
 * We need to map the technician ids to the skills they have.
 */
export type SUPPORTED_SKILLS = 
  | "Virtual Quote - Remodel"
  | "Virtual Quote - Repair/Install"
  | "Virtual Quote - Water Filtration"
  | "Virtual Service";

export interface TechnicianToSkillsMapping {
  technicianId: number;
  technicianName: string;
  skills: SUPPORTED_SKILLS[];
}

// The ST Technician API does not return the skills for technicians.
// We need to map the technician ids to the skills they have.
// This is a mapping of technician ids to the skills they have.
// Supported Skills
export const TECHNICIAN_TO_SKILLS_MAPPING: TechnicianToSkillsMapping[] = [
  {
    technicianId: 34365881,
    technicianName: "Pedro H.",
    skills: ["Virtual Quote - Water Filtration"],
  },
  {
    technicianId: 49786183,
    technicianName: "Doug W.",
    skills: [
      "Virtual Quote - Repair/Install",
      "Virtual Quote - Water Filtration",
    ],
  },
  {
    technicianId: 2513668,
    technicianName: "Michael G.",
    skills: ["Virtual Quote - Remodel"],
  },
  {
    technicianId: 16109753,
    technicianName: "Francisco J.",
    skills: ["Virtual Service", "Virtual Quote - Water Filtration"],
  },
];



// Custom Fields Mapping
// (76823347) -> Customer Join Link
// (76823352) -> Technician Join Link
export const CUSTOM_FIELDS_MAPPING = {
  customerJoinLink: 76823347,
  technicianJoinLink: 76823352,
};
