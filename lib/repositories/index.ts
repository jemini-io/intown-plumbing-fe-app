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
export { CustomerRepository } from './customers/CustomerRepository';
export { BookingRepository } from './bookings/BookingRepository';
export { AppSettingRepository } from './appSettings/AppSettingRepository';
export { PromoCodeRepository } from './promoCodes/PromoCodeRepository';
export type { BookingData } from './bookings/BookingRepository';
// export { UserRepository } from './users/UserRepository'; // waiting for Repository pattern refactor to be uncommented
