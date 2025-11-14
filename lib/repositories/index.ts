/**
 * Central export point for all repositories
 * This allows importing multiple repositories from a single location
 * 
 * Example usage:
 * import { ServiceRepository, TechnicianRepository } from '@/lib/repositories';
 */

export { ServiceRepository } from './services/ServiceRepository';
export { TechnicianRepository } from './technicians/TechnicianRepository';
export { SkillRepository } from './skills/SkillRepository';
// export { CustomerRepository } from './customers/CustomerRepository'; // waiting for Repository pattern refactor to be uncommented
// export { BookingRepository } from './bookings/BookingRepository'; // waiting for Repository pattern refactor to be uncommented
// export { UserRepository } from './users/UserRepository'; // waiting for Repository pattern refactor to be uncommented
