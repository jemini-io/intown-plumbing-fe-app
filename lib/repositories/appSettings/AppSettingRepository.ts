/**
 * Repository for AppSetting entity
 * Encapsulates all database access for AppSetting
 */

import { prisma } from "@/lib/prisma";
import { Setting } from "@/lib/types/setting";
import { ServiceRepository } from "../services/ServiceRepository";
import { SkillRepository } from "../skills/SkillRepository";
import { TechnicianRepository } from "../technicians/TechnicianRepository";
import { PromoCodeRepository } from "../promoCodes/PromoCodeRepository";
import { deleteFromCloudinary } from "@/lib/cloudinary/delete";
import pino from "pino";

const logger = pino({ name: 'AppSettingRepository' });

// Keys that are managed from database tables instead of AppSetting.value
const VIRTUAL_SETTING_KEYS = ['serviceToJobTypes', 'quoteSkills', 'technicianToSkills', 'promoCodes'] as const;
type VirtualSettingKey = typeof VIRTUAL_SETTING_KEYS[number];

export type SettingData = {
  key: string;
  value: string;
};

export class AppSettingRepository {
  /**
   * Generate serviceToJobTypes JSON from ServiceToJobType table
   */
  private static async generateServiceToJobTypesJSON(): Promise<string> {
    const prompt = 'AppSettingRepository.generateServiceToJobTypesJSON function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking ServiceRepository.findAll...`);
    const services = await ServiceRepository.findAll();
    logger.info(`${prompt} Found ${services.length} services.`);
    
    const jsonData = services.map(service => ({
      id: service.id, // Keep ID for database operations, but mark as readonly in editor
      displayName: service.displayName,
      serviceTitanId: service.serviceTitanId,
      serviceTitanName: service.serviceTitanName,
      emoji: service.emoji,
      icon: service.icon,
      description: service.description,
      skills: service.skills?.map(skill => ({
        id: skill.id,
        name: skill.name,
      })) || [],
      enabled: service.enabled,
    }));
    
    const jsonString = JSON.stringify(jsonData, null, 2);
    logger.info(`${prompt} Generated JSON string with length: ${jsonString.length}`);
    return jsonString;
  }

  /**
   * Generate quoteSkills JSON from Skill table (only quote-related skills)
   */
  private static async generateQuoteSkillsJSON(): Promise<string> {
    const prompt = 'AppSettingRepository.generateQuoteSkillsJSON function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking SkillRepository.findAll...`);
    const skills = await SkillRepository.findAll();
    logger.info(`${prompt} Found ${skills.length} skills.`);
    
    // Include ALL skills (not just those starting with "Virtual Quote")
    const quoteSkills = skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description || null,
      enabled: skill.enabled,
      serviceToJobTypes: skill.serviceToJobTypes?.map(service => ({
        id: service.id,
        name: service.displayName,
      })) || [],
      technicians: skill.technicians?.map(tech => ({
        id: tech.id,
        name: tech.technicianName,
      })) || [],
    }));
    
    const jsonString = JSON.stringify(quoteSkills, null, 2);
    logger.info(`${prompt} Generated JSON string with ${quoteSkills.length} skills.`);
    return jsonString;
  }

  /**
   * Generate technicianToSkills JSON from Technician table
   */
  private static async generateTechnicianToSkillsJSON(): Promise<string> {
    const prompt = 'AppSettingRepository.generateTechnicianToSkillsJSON function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.technician.findMany to get technicians with imageId...`);
    // Get technicians directly from Prisma to access imageId
    const techniciansWithImageId = await prisma.technician.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        skills: {
          include: { skill: true },
        },
        image: true,
      },
    });
    logger.info(`${prompt} Found ${techniciansWithImageId.length} technicians.`);
    
    const jsonData = techniciansWithImageId.map(tech => ({
      technicianId: tech.technicianId,
      technicianName: tech.technicianName,
      imageId: tech.imageId || null,
      skills: tech.skills?.map(rel => ({
        id: rel.skill.id,
        name: rel.skill.name,
      })) || [],
      enabled: tech.enabled,
    }));
    
    const jsonString = JSON.stringify(jsonData, null, 2);
    logger.info(`${prompt} Generated JSON string with length: ${jsonString.length}`);
    return jsonString;
  }

  /**
   * Generate promoCodes JSON from PromoCode table
   */
  private static async generatePromoCodesJSON(): Promise<string> {
    const prompt = 'AppSettingRepository.generatePromoCodesJSON function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking PromoCodeRepository.findAll...`);
    const promoCodes = await PromoCodeRepository.findAll();
    logger.info(`${prompt} Found ${promoCodes.length} promo codes.`);
    
    const jsonData = promoCodes.map(promoCode => ({
      id: promoCode.id, // Keep ID for database operations, but mark as readonly in editor
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value,
      description: promoCode.description || null,
      imageId: promoCode.imageId || null,
      image: promoCode.image ? {
        id: promoCode.image.id,
        url: promoCode.image.url,
        publicId: promoCode.image.publicId,
      } : null,
      usageLimit: promoCode.usageLimit || null,
      usageCount: promoCode.usageCount,
      minPurchase: promoCode.minPurchase || null,
      maxDiscount: promoCode.maxDiscount || null,
      startsAt: promoCode.startsAt ? promoCode.startsAt.toISOString() : null,
      expiresAt: promoCode.expiresAt ? promoCode.expiresAt.toISOString() : null,
      enabled: promoCode.enabled,
    }));
    
    const jsonString = JSON.stringify(jsonData, null, 2);
    logger.info(`${prompt} Generated JSON string with length: ${jsonString.length}`);
    return jsonString;
  }

  /**
   * Get virtual setting value by key
   */
  private static async getVirtualSettingValue(key: VirtualSettingKey): Promise<string> {
    const prompt = `AppSettingRepository.getVirtualSettingValue function says:`;
    logger.info(`${prompt} Starting for key: ${key}...`);
    
    switch (key) {
      case 'serviceToJobTypes':
        return await this.generateServiceToJobTypesJSON();
      case 'quoteSkills':
        return await this.generateQuoteSkillsJSON();
      case 'technicianToSkills':
        return await this.generateTechnicianToSkillsJSON();
      case 'promoCodes':
        return await this.generatePromoCodesJSON();
      default:
        logger.error(`${prompt} Unknown virtual setting key: ${key}`);
        return '[]';
    }
  }

  /**
   * Get all app settings
   * Includes virtual settings (serviceToJobTypes, quoteSkills, technicianToSkills, promoCodes) 
   * that are generated from database tables
   */
  static async findAll(): Promise<Setting[]> {
    const prompt = 'AppSettingRepository.findAll function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.appSetting.findMany with orderBy: { id: "asc" }...`);
    const appSettings = await prisma.appSetting.findMany({
      orderBy: { id: "asc" },
    });
    logger.info(`${prompt} Invocation of prisma.appSetting.findMany function successfully completed.`);
    
    // Create a map of existing settings by key
    const settingsMap = new Map<string, Setting>();
    appSettings.forEach(setting => {
      settingsMap.set(setting.key, setting);
    });
    
    // Process virtual settings: replace existing or create new entries
    for (const virtualKey of VIRTUAL_SETTING_KEYS) {
      logger.info(`${prompt} Processing virtual setting: ${virtualKey}...`);
      const virtualValue = await this.getVirtualSettingValue(virtualKey);
      
      if (settingsMap.has(virtualKey)) {
        // Replace existing setting with virtual value
        const existingSetting = settingsMap.get(virtualKey)!;
        existingSetting.value = virtualValue;
        logger.info(`${prompt} Replaced existing setting '${virtualKey}' with virtual value.`);
      } else {
        // Create virtual setting entry (with a temporary ID that won't conflict)
        // We'll use a negative ID to indicate it's virtual
        // Note: Virtual settings don't have createdAt/updatedAt as they're not in the database
        const virtualSetting: Setting = {
          id: -VIRTUAL_SETTING_KEYS.indexOf(virtualKey) - 1, // Negative IDs for virtual settings
          key: virtualKey,
          value: virtualValue,
        } as Setting;
        settingsMap.set(virtualKey, virtualSetting);
        logger.info(`${prompt} Created virtual setting '${virtualKey}'.`);
      }
    }
    
    // Convert map back to array and sort by key to maintain consistent order
    const allSettings = Array.from(settingsMap.values());
    allSettings.sort((a, b) => {
      // Virtual settings go after real settings
      if (a.id < 0 && b.id >= 0) return 1;
      if (a.id >= 0 && b.id < 0) return -1;
      // Within same type, sort by ID
      return a.id - b.id;
    });
    
    logger.info(`${prompt} Returning array of ${allSettings.length} app settings (${appSettings.length} real + ${allSettings.length - appSettings.length} virtual) to the caller.`);
    return allSettings;
  }

  /**
   * Get app setting by ID
   */
  static async findById(id: number): Promise<Setting | null> {
    const prompt = 'AppSettingRepository.findById function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.appSetting.findUnique with where: { id: ${id} }...`);
    const appSetting = await prisma.appSetting.findUnique({
      where: { id }
    })
    logger.info(`${prompt} Invocation of prisma.appSetting.findUnique function successfully completed.`);
    if (!appSetting) {
      logger.info(`${prompt} No app setting found with ID: ${id}. Returning null to the caller.`);
      return null;
    }
    
    // Check if this is a virtual setting key
    if (VIRTUAL_SETTING_KEYS.includes(appSetting.key as VirtualSettingKey)) {
      logger.info(`${prompt} Setting with key '${appSetting.key}' is a virtual setting. Generating value from database tables...`);
      const virtualValue = await this.getVirtualSettingValue(appSetting.key as VirtualSettingKey);
      return {
        ...appSetting,
        value: virtualValue,
      };
    }
    
    logger.info(`${prompt} App setting found with ID: ${appSetting.id}.`);
    logger.info(`${prompt} Returning the app setting with ID: ${appSetting.id} to the caller.`);
    logger.debug({ appSetting }, `App Setting "${id}`);
    return appSetting
  }

  /**
   * Get app setting by key
   */
  static async findByKey(key: string): Promise<Setting | null> {
    const prompt = 'getAppSettingByKey function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.appSetting.findUnique with where: { key: ${key} }...`);
    const appSetting = await prisma.appSetting.findUnique({
        where: { key }
    })
    logger.info(`${prompt} Invocation of prisma.appSetting.findUnique function successfully completed.`);

    if (!appSetting) {
        logger.info(`${prompt} No app setting found with key: ${key}. Returning null to the caller.`);
        return null;
    }

    // Check if this is a virtual setting key
    if (VIRTUAL_SETTING_KEYS.includes(key as VirtualSettingKey)) {
      logger.info(`${prompt} Setting with key '${key}' is a virtual setting. Generating value from database tables...`);
      const virtualValue = await this.getVirtualSettingValue(key as VirtualSettingKey);
      return {
        ...appSetting,
        value: virtualValue,
      };
    }

    logger.info(`${prompt} App setting found with key: ${key}.`);
    logger.info(`${prompt} Returning the app setting with key: ${key} to the caller.`);
    logger.debug({ appSetting }, `App Setting "${key}`);
    return appSetting
  }

  /**
   * Create a new app setting
   */
  static async create(setting: SettingData): Promise<Setting> {
    const prompt = 'AppSettingRepository.create function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.appSetting.create...`);
    const appSetting = await prisma.appSetting.create({ 
        data: {
            key: setting.key,
            value: setting.value,
        }
    });
    logger.info(`${prompt} Invocation of prisma.appSetting.create function successfully completed.`);
    logger.info(`${prompt} App setting created with ID: ${appSetting.id}.`);
    logger.info(`${prompt} Returning the app setting with ID: ${appSetting.id} to the caller.`);
    return appSetting;
  }

  /**
   * Update serviceToJobTypes from JSON
   * Compares original and new JSON to detect changes and updates database accordingly
   */
  private static async updateServiceToJobTypes(originalJson: string, newJson: string): Promise<void> {
    const prompt = 'AppSettingRepository.updateServiceToJobTypes function says:';
    logger.info(`${prompt} Starting...`);
    
    try {
      const original = JSON.parse(originalJson) as Array<{
        id: string;
        displayName: string;
        serviceTitanId: number;
        serviceTitanName: string;
        emoji: string;
        icon: string;
        description: string;
        skills: Array<{ id: string; name: string }>;
        enabled: boolean;
      }>;
      
      const updated = JSON.parse(newJson) as Array<{
        id: string;
        displayName: string;
        serviceTitanId: number;
        serviceTitanName: string;
        emoji: string;
        icon: string;
        description: string;
        skills: Array<{ id: string; name: string }>;
        enabled: boolean;
      }>;
      
      // Create maps for easier lookup (using id as key)
      const originalMap = new Map(original.map(s => [s.id, s]));
      const updatedMap = new Map(updated.map(s => [s.id, s]));
      
      // Process each service in the updated JSON
      for (const updatedService of updated) {
        const originalService = originalMap.get(updatedService.id);
        
        if (originalService) {
          // Service exists - check if it needs updating
          const needsUpdate = 
            originalService.displayName !== updatedService.displayName ||
            originalService.serviceTitanId !== updatedService.serviceTitanId ||
            originalService.serviceTitanName !== updatedService.serviceTitanName ||
            originalService.emoji !== updatedService.emoji ||
            originalService.icon !== updatedService.icon ||
            originalService.description !== updatedService.description ||
            originalService.enabled !== updatedService.enabled;
          
          if (needsUpdate) {
            logger.info(`${prompt} Updating service with ID: ${updatedService.id}...`);
            await ServiceRepository.update(updatedService.id, {
              displayName: updatedService.displayName,
              serviceTitanId: updatedService.serviceTitanId,
              serviceTitanName: updatedService.serviceTitanName,
              emoji: updatedService.emoji,
              icon: updatedService.icon,
              description: updatedService.description,
              enabled: updatedService.enabled,
            });
          }
          
          // Update skills relations
          const originalSkillIds = new Set(originalService.skills.map(s => s.id));
          const updatedSkillIds = new Set(updatedService.skills.map(s => s.id));
          
          // Find skills to add
          const skillsToAdd = updatedService.skills.filter(s => !originalSkillIds.has(s.id));
          // Find skills to remove
          const skillsToRemove = originalService.skills.filter(s => !updatedSkillIds.has(s.id));
          
          // Add new skill relations
          for (const skill of skillsToAdd) {
            logger.info(`${prompt} Adding skill ${skill.id} to service ${updatedService.id}...`);
            await ServiceRepository.linkSkill(updatedService.id, skill.id);
          }
          
          // Remove skill relations
          for (const skill of skillsToRemove) {
            logger.info(`${prompt} Removing skill ${skill.id} from service ${updatedService.id}...`);
            await ServiceRepository.unlinkSkill(updatedService.id, skill.id);
          }
        } else {
          // New service - this shouldn't happen for virtual settings, but handle it
          logger.warn(`${prompt} Service with ID ${updatedService.id} not found in original. Skipping.`);
        }
      }
      
      // Check for deleted services (in original but not in updated)
      for (const originalService of original) {
        if (!updatedMap.has(originalService.id)) {
          logger.info(`${prompt} Service ${originalService.id} was deleted from JSON. Deleting from database...`);
          
          // Delete skill relations first
          if (originalService.skills && originalService.skills.length > 0) {
            logger.info(`${prompt} Deleting skill relations for service ${originalService.id}...`);
            await prisma.serviceToJobTypeSkill.deleteMany({
              where: { serviceToJobTypeId: originalService.id },
            });
            logger.info(`${prompt} Skill relations deleted successfully.`);
          }
          
          // Delete the service itself
          logger.info(`${prompt} Deleting service with ID: ${originalService.id}...`);
          await ServiceRepository.delete(originalService.id);
          logger.info(`${prompt} Service deleted successfully.`);
        }
      }
      
      logger.info(`${prompt} Successfully updated serviceToJobTypes.`);
    } catch (error) {
      logger.error({ error }, `${prompt} Error updating serviceToJobTypes`);
      throw error;
    }
  }

  /**
   * Update quoteSkills from JSON
   * Compares original and new JSON to detect changes and updates database accordingly
   */
  private static async updateQuoteSkills(originalJson: string, newJson: string): Promise<void> {
    const prompt = 'AppSettingRepository.updateQuoteSkills function says:';
    logger.info(`${prompt} Starting...`);
    
    try {
      const original = JSON.parse(originalJson) as Array<{
        id: string;
        name: string;
        description: string | null;
        enabled: boolean;
        serviceToJobTypes: Array<{ id: string; name: string }>;
        technicians: Array<{ id: string; name: string }>;
      }>;
      
      const updated = JSON.parse(newJson) as Array<{
        id: string;
        name: string;
        description: string | null;
        enabled: boolean;
        serviceToJobTypes: Array<{ id: string; name: string }>;
        technicians: Array<{ id: string; name: string }>;
      }>;
      
      // Create maps for easier lookup
      const originalMap = new Map(original.map(s => [s.id, s]));
      const updatedMap = new Map(updated.map(s => [s.id, s]));
      
      // Process each skill in the updated JSON
      for (const updatedSkill of updated) {
        const originalSkill = originalMap.get(updatedSkill.id);
        
        if (originalSkill) {
          // Skill exists - check if it needs updating
          const needsUpdate = 
            originalSkill.name !== updatedSkill.name ||
            originalSkill.description !== updatedSkill.description ||
            originalSkill.enabled !== updatedSkill.enabled;
          
          if (needsUpdate) {
            logger.info(`${prompt} Updating skill with ID: ${updatedSkill.id}...`);
            await SkillRepository.update(updatedSkill.id, {
              name: updatedSkill.name,
              description: updatedSkill.description || undefined,
              enabled: updatedSkill.enabled,
            });
          }
          
          // Update service relations
          const originalServiceIds = new Set(originalSkill.serviceToJobTypes.map(s => s.id));
          const updatedServiceIds = new Set(updatedSkill.serviceToJobTypes.map(s => s.id));
          
          const servicesToAdd = updatedSkill.serviceToJobTypes.filter(s => !originalServiceIds.has(s.id));
          const servicesToRemove = originalSkill.serviceToJobTypes.filter(s => !updatedServiceIds.has(s.id));
          
          for (const service of servicesToAdd) {
            logger.info(`${prompt} Adding service ${service.id} to skill ${updatedSkill.id}...`);
            await SkillRepository.linkService(updatedSkill.id, service.id);
          }
          
          for (const service of servicesToRemove) {
            logger.info(`${prompt} Removing service ${service.id} from skill ${updatedSkill.id}...`);
            await SkillRepository.unlinkService(updatedSkill.id, service.id);
          }
          
          // Update technician relations
          const originalTechnicianIds = new Set(originalSkill.technicians.map(t => t.id));
          const updatedTechnicianIds = new Set(updatedSkill.technicians.map(t => t.id));
          
          const techniciansToAdd = updatedSkill.technicians.filter(t => !originalTechnicianIds.has(t.id));
          const techniciansToRemove = originalSkill.technicians.filter(t => !updatedTechnicianIds.has(t.id));
          
          for (const technician of techniciansToAdd) {
            logger.info(`${prompt} Adding technician ${technician.id} to skill ${updatedSkill.id}...`);
            await SkillRepository.linkTechnician(updatedSkill.id, technician.id);
          }
          
          for (const technician of techniciansToRemove) {
            logger.info(`${prompt} Removing technician ${technician.id} from skill ${updatedSkill.id}...`);
            await SkillRepository.unlinkTechnician(updatedSkill.id, technician.id);
          }
        } else {
          logger.warn(`${prompt} Skill with ID ${updatedSkill.id} not found in original. Skipping.`);
        }
      }
      
      // Check for deleted skills (in original but not in updated)
      for (const originalSkill of original) {
        if (!updatedMap.has(originalSkill.id)) {
          logger.info(`${prompt} Skill with ID ${originalSkill.id} was deleted from JSON. Deleting from database...`);
          
          // Delete service relations
          if (originalSkill.serviceToJobTypes && originalSkill.serviceToJobTypes.length > 0) {
            logger.info(`${prompt} Deleting service relations for skill ${originalSkill.id}...`);
            await SkillRepository.deleteServiceRelations(originalSkill.id);
            logger.info(`${prompt} Service relations deleted successfully.`);
          }
          
          // Delete technician relations
          if (originalSkill.technicians && originalSkill.technicians.length > 0) {
            logger.info(`${prompt} Deleting technician relations for skill ${originalSkill.id}...`);
            await SkillRepository.deleteTechnicianRelations(originalSkill.id);
            logger.info(`${prompt} Technician relations deleted successfully.`);
          }
          
          // Delete the skill itself
          logger.info(`${prompt} Deleting skill with ID: ${originalSkill.id}...`);
          await SkillRepository.delete(originalSkill.id);
          logger.info(`${prompt} Skill deleted successfully.`);
        }
      }
      
      logger.info(`${prompt} Successfully updated quoteSkills.`);
    } catch (error) {
      logger.error({ error }, `${prompt} Error updating quoteSkills`);
      throw error;
    }
  }

  /**
   * Update technicianToSkills from JSON
   * Compares original and new JSON to detect changes and updates database accordingly
   */
  private static async updateTechnicianToSkills(originalJson: string, newJson: string): Promise<void> {
    const prompt = 'AppSettingRepository.updateTechnicianToSkills function says:';
    logger.info(`${prompt} Starting...`);
    
    try {
      const original = JSON.parse(originalJson) as Array<{
        technicianId: number;
        technicianName: string;
        imageId: string | null;
        skills: Array<{ id: string; name: string }>;
        enabled: boolean;
      }>;
      
      const updated = JSON.parse(newJson) as Array<{
        technicianId: number;
        technicianName: string;
        imageId: string | null;
        skills: Array<{ id: string; name: string }>;
        enabled: boolean;
      }>;
      
      // Create maps for easier lookup (using technicianId as key)
      const originalMap = new Map(original.map(t => [t.technicianId, t]));
      const updatedMap = new Map(updated.map(t => [t.technicianId, t]));
      
      // Get all technicians from database once
      const technicians = await TechnicianRepository.findAll();
      const techniciansMap = new Map(technicians.map(t => [t.technicianId, t]));
      
      // Process each technician in the updated JSON
      for (const updatedTech of updated) {
        const originalTech = originalMap.get(updatedTech.technicianId);
        const technician = techniciansMap.get(updatedTech.technicianId);
        
        if (!technician) {
          logger.warn(`${prompt} Technician with technicianId ${updatedTech.technicianId} not found in database. Skipping.`);
          continue;
        }
        
        if (originalTech) {
          // Check if imageId changed to null/empty (image deletion requested)
          const imageRemoved = originalTech.imageId && !updatedTech.imageId;
          
          if (imageRemoved) {
            logger.info(`${prompt} Image removal requested for technician ${technician.id}...`);
            
            // Get technician with image details to access publicId
            const technicianWithImage = await TechnicianRepository.findByIdWithImageAndSkills(technician.id);
            
            if (technicianWithImage?.image) {
              // Step 1: Delete from Cloudinary
              if (technicianWithImage.image.publicId) {
                logger.info(`${prompt} Deleting image from Cloudinary with publicId: ${technicianWithImage.image.publicId}...`);
                await deleteFromCloudinary(technicianWithImage.image.publicId);
                logger.info(`${prompt} Image deleted from Cloudinary successfully.`);
              }
              
              // Step 2: Delete Image entry from database
              if (technicianWithImage.image.id) {
                logger.info(`${prompt} Deleting Image entry from database with ID: ${technicianWithImage.image.id}...`);
                await TechnicianRepository.deleteImage(technicianWithImage.image.id);
                logger.info(`${prompt} Image entry deleted from database successfully.`);
              }
            }
          }
          
          // Check if it needs updating
          const needsUpdate = 
            originalTech.technicianName !== updatedTech.technicianName ||
            originalTech.enabled !== updatedTech.enabled ||
            originalTech.imageId !== updatedTech.imageId;
          
          if (needsUpdate) {
            logger.info(`${prompt} Updating technician with ID: ${technician.id}...`);
            await TechnicianRepository.update(technician.id, {
              technicianName: updatedTech.technicianName,
              enabled: updatedTech.enabled,
              imageId: updatedTech.imageId || null,
            });
          }
          
          // Update skill relations
          const originalSkillIds = new Set(originalTech.skills.map(s => s.id));
          const updatedSkillIds = new Set(updatedTech.skills.map(s => s.id));
          
          const skillsToAdd = updatedTech.skills.filter(s => !originalSkillIds.has(s.id));
          const skillsToRemove = originalTech.skills.filter(s => !updatedSkillIds.has(s.id));
          
          for (const skill of skillsToAdd) {
            logger.info(`${prompt} Adding skill ${skill.id} to technician ${technician.id}...`);
            await TechnicianRepository.linkSkill(technician.id, skill.id);
          }
          
          for (const skill of skillsToRemove) {
            logger.info(`${prompt} Removing skill ${skill.id} from technician ${technician.id}...`);
            await TechnicianRepository.unlinkSkill(technician.id, skill.id);
          }
        } else {
          logger.warn(`${prompt} Technician with technicianId ${updatedTech.technicianId} not found in original. Skipping.`);
        }
      }
      
      // Check for deleted technicians (in original but not in updated)
      for (const originalTech of original) {
        if (!updatedMap.has(originalTech.technicianId)) {
          logger.info(`${prompt} Technician with technicianId ${originalTech.technicianId} was deleted from JSON. Deleting from database...`);
          const technician = techniciansMap.get(originalTech.technicianId);
          
          if (technician) {
            // Get technician with image details to access publicId
            const technicianWithImage = await TechnicianRepository.findByIdWithImageAndSkills(technician.id);
            
            // Delete image from Cloudinary if it exists
            if (technicianWithImage?.image?.publicId) {
              logger.info(`${prompt} Deleting image from Cloudinary with publicId: ${technicianWithImage.image.publicId}...`);
              await deleteFromCloudinary(technicianWithImage.image.publicId);
              logger.info(`${prompt} Image deleted from Cloudinary successfully.`);
            }
            
            // Delete Image entry from database if it exists
            if (technicianWithImage?.image?.id) {
              logger.info(`${prompt} Deleting Image entry from database with ID: ${technicianWithImage.image.id}...`);
              await TechnicianRepository.deleteImage(technicianWithImage.image.id);
              logger.info(`${prompt} Image entry deleted from database successfully.`);
            }
            
            // Delete skill relations
            if (technician.skills && technician.skills.length > 0) {
              logger.info(`${prompt} Deleting skill relations for technician ${technician.id}...`);
              await TechnicianRepository.deleteSkillRelations(technician.id);
              logger.info(`${prompt} Skill relations deleted successfully.`);
            }
            
            // Delete the technician itself
            logger.info(`${prompt} Deleting technician with ID: ${technician.id}...`);
            await TechnicianRepository.delete(technician.id);
            logger.info(`${prompt} Technician deleted successfully.`);
          } else {
            logger.warn(`${prompt} Technician with technicianId ${originalTech.technicianId} not found in database. Skipping deletion.`);
          }
        }
      }
      
      logger.info(`${prompt} Successfully updated technicianToSkills.`);
    } catch (error) {
      logger.error({ error }, `${prompt} Error updating technicianToSkills`);
      throw error;
    }
  }

  /**
   * Update promoCodes from JSON
   * Compares original and new JSON to detect changes and updates database accordingly
   */
  private static async updatePromoCodes(originalJson: string, newJson: string): Promise<void> {
    const prompt = 'AppSettingRepository.updatePromoCodes function says:';
    logger.info(`${prompt} Starting...`);
    
    try {
      const original = JSON.parse(originalJson) as Array<{
        id: string;
        code: string;
        type: 'PERCENT' | 'AMOUNT';
        value: number;
        description: string | null;
        imageId: string | null;
        image: { id: string; url: string; publicId: string } | null;
        usageLimit: number | null;
        usageCount: number;
        minPurchase: number | null;
        maxDiscount: number | null;
        startsAt: string | null;
        expiresAt: string | null;
        enabled: boolean;
      }>;
      
      const updated = JSON.parse(newJson) as Array<{
        id: string;
        code: string;
        type: 'PERCENT' | 'AMOUNT';
        value: number;
        description: string | null;
        imageId: string | null;
        image: { id: string; url: string; publicId: string } | null;
        usageLimit: number | null;
        usageCount: number;
        minPurchase: number | null;
        maxDiscount: number | null;
        startsAt: string | null;
        expiresAt: string | null;
        enabled: boolean;
      }>;
      
      // Create maps for easier lookup (using id as key)
      const originalMap = new Map(original.map(p => [p.id, p]));
      const updatedMap = new Map(updated.map(p => [p.id, p]));
      
      // Process each promo code in the updated JSON
      for (const updatedPromo of updated) {
        const originalPromo = originalMap.get(updatedPromo.id);
        
        if (originalPromo) {
          // Promo code exists - check if it needs updating
          const needsUpdate = 
            originalPromo.code !== updatedPromo.code ||
            originalPromo.type !== updatedPromo.type ||
            originalPromo.value !== updatedPromo.value ||
            originalPromo.description !== updatedPromo.description ||
            originalPromo.imageId !== updatedPromo.imageId ||
            originalPromo.usageLimit !== updatedPromo.usageLimit ||
            originalPromo.minPurchase !== updatedPromo.minPurchase ||
            originalPromo.maxDiscount !== updatedPromo.maxDiscount ||
            originalPromo.startsAt !== updatedPromo.startsAt ||
            originalPromo.expiresAt !== updatedPromo.expiresAt ||
            originalPromo.enabled !== updatedPromo.enabled;
          
          if (needsUpdate) {
            logger.info(`${prompt} Updating promo code with ID: ${updatedPromo.id}...`);
            await PromoCodeRepository.update(updatedPromo.id, {
              code: updatedPromo.code,
              type: updatedPromo.type,
              value: updatedPromo.value,
              description: updatedPromo.description || undefined,
              imageId: updatedPromo.imageId || undefined,
              usageLimit: updatedPromo.usageLimit || undefined,
              minPurchase: updatedPromo.minPurchase || undefined,
              maxDiscount: updatedPromo.maxDiscount || undefined,
              startsAt: updatedPromo.startsAt ? new Date(updatedPromo.startsAt) : undefined,
              expiresAt: updatedPromo.expiresAt ? new Date(updatedPromo.expiresAt) : undefined,
              enabled: updatedPromo.enabled,
            });
          }
        } else {
          // New promo code - create it
          logger.info(`${prompt} Creating new promo code with ID: ${updatedPromo.id}...`);
          await PromoCodeRepository.create({
            code: updatedPromo.code,
            type: updatedPromo.type,
            value: updatedPromo.value,
            description: updatedPromo.description || undefined,
            imageId: updatedPromo.imageId || undefined,
            usageLimit: updatedPromo.usageLimit || undefined,
            minPurchase: updatedPromo.minPurchase || undefined,
            maxDiscount: updatedPromo.maxDiscount || undefined,
            startsAt: updatedPromo.startsAt ? new Date(updatedPromo.startsAt) : undefined,
            expiresAt: updatedPromo.expiresAt ? new Date(updatedPromo.expiresAt) : undefined,
            enabled: updatedPromo.enabled,
          });
        }
      }
      
      // Check for deleted promo codes (in original but not in updated)
      for (const originalPromo of original) {
        if (!updatedMap.has(originalPromo.id)) {
          logger.info(`${prompt} Promo code ${originalPromo.id} was deleted from JSON. Deleting from database...`);
          
          // Delete image from Cloudinary if it exists
          if (originalPromo.image?.publicId) {
            logger.info(`${prompt} Deleting image from Cloudinary with publicId: ${originalPromo.image.publicId}...`);
            await deleteFromCloudinary(originalPromo.image.publicId);
            logger.info(`${prompt} Image deleted from Cloudinary successfully.`);
          }
          
          // Delete the promo code itself (this will cascade delete the image relation)
          logger.info(`${prompt} Deleting promo code with ID: ${originalPromo.id}...`);
          await PromoCodeRepository.delete(originalPromo.id);
          logger.info(`${prompt} Promo code deleted successfully.`);
        }
      }
      
      logger.info(`${prompt} Successfully updated promoCodes.`);
    } catch (error) {
      logger.error({ error }, `${prompt} Error updating promoCodes`);
      throw error;
    }
  }

  /**
   * Update an app setting
   * For virtual settings, updates the corresponding database tables instead of AppSetting.value
   */
  static async update(id: number, setting: SettingData): Promise<Setting> {
    const prompt = 'AppSettingRepository.update function says:';
    logger.info(`${prompt} Starting...`);
    
    // First, get the original setting to compare
    const originalSetting = await this.findById(id);
    if (!originalSetting) {
      throw new Error(`Setting with ID ${id} not found`);
    }
    
    // Check if this is a virtual setting
    if (VIRTUAL_SETTING_KEYS.includes(setting.key as VirtualSettingKey)) {
      logger.info(`${prompt} Setting '${setting.key}' is a virtual setting. Updating database tables...`);
      
      // Get the original JSON value (from database tables)
      const originalJson = await this.getVirtualSettingValue(setting.key as VirtualSettingKey);
      
      // Update the corresponding database tables based on the JSON changes
      switch (setting.key as VirtualSettingKey) {
        case 'serviceToJobTypes':
          await this.updateServiceToJobTypes(originalJson, setting.value);
          break;
        case 'quoteSkills':
          await this.updateQuoteSkills(originalJson, setting.value);
          break;
        case 'technicianToSkills':
          await this.updateTechnicianToSkills(originalJson, setting.value);
          break;
        case 'promoCodes':
          await this.updatePromoCodes(originalJson, setting.value);
          break;
      }
      
      // Return the updated setting (regenerated from database)
      const updatedValue = await this.getVirtualSettingValue(setting.key as VirtualSettingKey);
      return {
        ...originalSetting,
        value: updatedValue,
      };
    }
    
    // Regular setting - update AppSetting table
    logger.info(`${prompt} Invoking prisma.appSetting.update with where: { id: ${id} }...`);
    const appSetting = await prisma.appSetting.update({ 
        where: { id },
        data: {
            key: setting.key,
            value: setting.value,
        }
    });
    logger.info(`${prompt} Invocation of prisma.appSetting.update function successfully completed.`);
    logger.info(`${prompt} App setting updated with ID: ${appSetting.id}.`);
    logger.info(`${prompt} Returning the app setting with ID: ${appSetting.id} to the caller.`);
    return appSetting;
  }

  /**
   * Delete serviceToJobTypes data (all services and their relations)
   */
  private static async deleteServiceToJobTypes(): Promise<void> {
    const prompt = 'AppSettingRepository.deleteServiceToJobTypes function says:';
    logger.info(`${prompt} Starting...`);
    
    // Get all services
    const services = await ServiceRepository.findAll();
    logger.info(`${prompt} Found ${services.length} services to delete.`);
    
    // Delete each service (this will cascade delete relations)
    for (const service of services) {
      logger.info(`${prompt} Deleting service with ID: ${service.id}...`);
      await ServiceRepository.delete(service.id);
    }
    
    logger.info(`${prompt} Successfully deleted all serviceToJobTypes data.`);
  }

  /**
   * Delete quoteSkills data (all skills and their relations)
   */
  private static async deleteQuoteSkills(): Promise<void> {
    const prompt = 'AppSettingRepository.deleteQuoteSkills function says:';
    logger.info(`${prompt} Starting...`);
    
    // Get all skills
    const skills = await SkillRepository.findAll();
    logger.info(`${prompt} Found ${skills.length} skills to delete.`);
    
    // Delete each skill (this will handle relations)
    for (const skill of skills) {
      logger.info(`${prompt} Deleting skill with ID: ${skill.id}...`);
      await SkillRepository.delete(skill.id);
    }
    
    logger.info(`${prompt} Successfully deleted all quoteSkills data.`);
  }

  /**
   * Delete technicianToSkills data (all technicians and their relations)
   */
  private static async deleteTechnicianToSkills(): Promise<void> {
    const prompt = 'AppSettingRepository.deleteTechnicianToSkills function says:';
    logger.info(`${prompt} Starting...`);
    
    // Get all technicians with images
    const technicians = await TechnicianRepository.findAll();
    logger.info(`${prompt} Found ${technicians.length} technicians to delete.`);
    
    // Delete each technician (this will handle relations and images)
    for (const technician of technicians) {
      logger.info(`${prompt} Deleting technician with ID: ${technician.id}...`);
      
      // Get technician with image details to access publicId
      const technicianWithImage = await TechnicianRepository.findByIdWithImageAndSkills(technician.id);
      
      // Delete image from Cloudinary if it exists
      if (technicianWithImage?.image?.publicId) {
        logger.info(`${prompt} Deleting image from Cloudinary with publicId: ${technicianWithImage.image.publicId}...`);
        await deleteFromCloudinary(technicianWithImage.image.publicId);
        logger.info(`${prompt} Image deleted from Cloudinary successfully.`);
      }
      
      // Delete Image entry from database if it exists
      if (technicianWithImage?.image?.id) {
        logger.info(`${prompt} Deleting Image entry from database with ID: ${technicianWithImage.image.id}...`);
        await TechnicianRepository.deleteImage(technicianWithImage.image.id);
        logger.info(`${prompt} Image entry deleted from database successfully.`);
      }
      
      // Delete skill relations
      if (technician.skills && technician.skills.length > 0) {
        logger.info(`${prompt} Deleting skill relations for technician ${technician.id}...`);
        await TechnicianRepository.deleteSkillRelations(technician.id);
        logger.info(`${prompt} Skill relations deleted successfully.`);
      }
      
      // Delete the technician itself
      logger.info(`${prompt} Deleting technician with ID: ${technician.id}...`);
      await TechnicianRepository.delete(technician.id);
      logger.info(`${prompt} Technician deleted successfully.`);
    }
    
    logger.info(`${prompt} Successfully deleted all technicianToSkills data.`);
  }

  /**
   * Delete promoCodes data (all promo codes and their images)
   */
  private static async deletePromoCodes(): Promise<void> {
    const prompt = 'AppSettingRepository.deletePromoCodes function says:';
    logger.info(`${prompt} Starting...`);
    
    // Get all promo codes
    const promoCodes = await PromoCodeRepository.findAll();
    logger.info(`${prompt} Found ${promoCodes.length} promo codes to delete.`);
    
    // Delete each promo code (this will handle images)
    for (const promoCode of promoCodes) {
      logger.info(`${prompt} Deleting promo code with ID: ${promoCode.id}...`);
      
      // Delete image from Cloudinary if it exists
      if (promoCode.image?.publicId) {
        logger.info(`${prompt} Deleting image from Cloudinary with publicId: ${promoCode.image.publicId}...`);
        await deleteFromCloudinary(promoCode.image.publicId);
        logger.info(`${prompt} Image deleted from Cloudinary successfully.`);
      }
      
      // Delete the promo code itself (this will cascade delete the image relation)
      await PromoCodeRepository.delete(promoCode.id);
      logger.info(`${prompt} Promo code deleted successfully.`);
    }
    
    logger.info(`${prompt} Successfully deleted all promoCodes data.`);
  }

  /**
   * Delete an app setting
   * For virtual settings, deletes the corresponding database tables data
   */
  static async delete(id: number): Promise<Setting> {
    const prompt = 'AppSettingRepository.delete function says:';
    logger.info(`${prompt} Starting...`);
    
    // First, get the setting to check if it's virtual
    logger.info(`${prompt} Invoking this.findById with ID: ${id}...`);
    const setting = await this.findById(id);
    
    if (!setting) {
      throw new Error(`Setting with ID ${id} not found`);
    }
    
    // Check if it's a virtual setting
    if (VIRTUAL_SETTING_KEYS.includes(setting.key as VirtualSettingKey)) {
      logger.info(`${prompt} Setting "${setting.key}" is a virtual setting. Deleting related data...`);
      
      // Handle deletion based on setting type
      switch (setting.key as VirtualSettingKey) {
        case 'serviceToJobTypes':
          await this.deleteServiceToJobTypes();
          break;
        case 'quoteSkills':
          await this.deleteQuoteSkills();
          break;
        case 'technicianToSkills':
          await this.deleteTechnicianToSkills();
          break;
        case 'promoCodes':
          await this.deletePromoCodes();
          break;
      }
      
      logger.info(`${prompt} Virtual setting data deleted. Note: Virtual settings are not stored in AppSetting table.`);
      
      // Return a mock setting object for virtual settings (they don't exist in DB)
      return {
        id: setting.id,
        key: setting.key,
        value: setting.value,
      };
    }
    
    // Regular setting - delete from AppSetting table
    logger.info(`${prompt} Setting "${setting.key}" is a regular setting. Deleting from AppSetting table...`);
    logger.info(`${prompt} Invoking prisma.appSetting.delete with where: { id: ${id} }...`);
    const deletedAppSetting = await prisma.appSetting.delete({ 
        where: { id },
    });
    logger.info(`${prompt} Invocation of prisma.appSetting.delete function successfully completed.`);
    logger.info(`${prompt} App setting deleted with ID: ${deletedAppSetting.id}.`);
    logger.info(`${prompt} Returning the deleted app setting with ID: ${deletedAppSetting.id} to the caller.`);
    return deletedAppSetting;
  }
}