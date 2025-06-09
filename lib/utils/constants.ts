export const THIRTY_MINUTES = 30 * 60000;

// Pricebook -> Virtual Service 1:1 Customer / Tech
export const VIRTUAL_SERVICE_SKU_ID = 76811280;
// "Virtual Service" business unit
export const BUSINESS_UNIT_ID = 76816943;
// "Direct Web Traffic" campaign
export const CAMPAIGN_ID = 46989774;

export interface ServiceToJobTypeMapping {
  id: number;
  displayName: string;
  serviceTitanId: number;
  serviceTitanName: string;
}

export const SERVICE_TO_JOB_TYPES_MAPPING = [
  {
    id: 1,
    displayName: "Help me with a repair",
    serviceTitanId: 76820748,
    serviceTitanName: "Virtual Consultation - Quote Request",
  },
  {
    id: 2,
    displayName: "Help! Emergency!",
    serviceTitanId: 76820748,
    serviceTitanName: "Virtual Consultation - Service Request",
  },
  {
    id: 3,
    displayName: "I need a quote",
    serviceTitanId: 76820749,
    serviceTitanName: "Virtual Consultation - Service Request",
  },
  
];