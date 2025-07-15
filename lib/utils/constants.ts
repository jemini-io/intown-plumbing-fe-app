export const THIRTY_MINUTES = 30 * 60000;

// Pricebook -> Virtual Service 1:1 Customer / Tech
export const VIRTUAL_SERVICE_SKU_ID = 76811280;
// "Service" business unit
export const BUSINESS_UNIT_ID = 4282891;
// "Direct Web Traffic" campaign
export const CAMPAIGN_ID = 46989774;

export const PODIUM_LOCATION_ID = "ce0abd8b-af60-587f-bef5-aea4b16ccb2a";

export interface ServiceToJobTypeMapping {
  id: number;
  displayName: string;
  serviceTitanId: number;
  serviceTitanName: string;
  emoji: string;
  description: string; // Added description field
}

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
  },
];

/**
 * Service Titan doesn't return the skills for technicians.
 * We need to map the technician ids to the skills they have.
 */
export interface TechnicianToSkillsMapping {
  technicianId: number;
  technicianName: string;
  skills: string[];
}

// Supported Skills
// Virtual Quote
// Virtual Quote - Remodel	
// Virtual Quote - Repair/Install	
// Virtual Quote - Water Filtration	
// Virtual Service
export const TECHNICIAN_TO_SKILLS_MAPPING: TechnicianToSkillsMapping[] = [
  {
    technicianId: 34365881,
    technicianName: "Pedro H.",
    skills: ["Virtual Quote"],
  },
  {
    technicianId: 49786183,
    technicianName: "Doug W.",
    skills: ["Virtual Service"],
  },
];

// Custom Fields Mapping
// (76823347) -> Customer Join Link
// (76823352) -> Technician Join Link
export const CUSTOM_FIELDS_MAPPING = {
  customerJoinLink: 76823347,
  technicianJoinLink: 76823352,
};