/**
 * Central export point for all repositories
 * This allows importing multiple repositories from a single location
 * 
 * Example usage:
 * import { ServiceToJobTypeRepository, CustomerRepository } from '@/lib/repositories';
 */

export { ServiceRepository } from './ServiceRepository';
export { TechnicianRepository } from './TechnicianRepository';

// Add other repositories as they are created:
// export { CustomerRepository } from './CustomerRepository';
// export { BookingRepository } from './BookingRepository';
// etc.

