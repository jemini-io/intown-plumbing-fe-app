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
}

export interface CustomerServiceToJobTypeMapping {
  id: number;
  displayName: string;
  serviceTitanId: number;
  serviceTitanName: string;
}

export const SERVICE_TO_JOB_TYPES_MAPPING: CustomerServiceToJobTypeMapping[] = [
  {
    id: 1,
    displayName: "Help me with a repair",
    serviceTitanId: 76820749,
    serviceTitanName: "Virtual Consultation - Service Request",
  },
  {
    id: 2,
    displayName: "Help! Emergency!",
    serviceTitanId: 76820749,
    serviceTitanName: "Virtual Consultation - Service Request",
  },
  {
    id: 3,
    displayName: "I need a quote",
    serviceTitanId: 76820748,
    serviceTitanName: "Virtual Consultation - Quote Request",
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