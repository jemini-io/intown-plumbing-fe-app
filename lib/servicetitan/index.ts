export { ServiceTitanClient } from './client';
export type { ServiceTitanAuth } from './client/base-client';

// Re-export commonly used types (will be available after generation)
// export type {
//   JobType,
//   Appointment,
//   Customer,
//   // Add other commonly used types here
// } from './generated/jpm'; 

// Export CRM types
export type {
  Crm_V2_Customers_CustomerResponse,
  Crm_V2_Customers_CreateCustomerRequest,
  Crm_V2_Locations_LocationResponse,
  Crm_V2_Locations_CreateLocationRequest
} from './generated/crm'; 