/**
 * Repository for AppSetting entity
 * Encapsulates all database access for AppSetting
 */

import { prisma } from "@/lib/prisma";
import { Setting } from "@/lib/types/setting";
import pino from "pino";

const logger = pino({ name: 'AppSettingRepository' });

export type SettingData = {
  key: string;
  value: string;
};

export class AppSettingRepository {
  /**
   * Get all app settings
   */
  static async findAll(): Promise<Setting[]> {
    const prompt = 'AppSettingRepository.findAll function says:';
    logger.info(`${prompt} Starting...`);
    logger.info(`${prompt} Invoking prisma.appSetting.findMany with orderBy: { id: "asc" }...`);
    const appSettings = await prisma.appSetting.findMany({
      orderBy: { id: "asc" },
    });
    logger.info(`${prompt} Invocation of prisma.appSetting.findMany function successfully completed.`);
    if (appSettings.length === 0) {
      logger.info(`${prompt} No app settings found. Returning empty array to the caller.`);
      return [];
    }
    logger.info(`${prompt} Returning array of ${appSettings.length} app settings to the caller.`);
    return appSettings;
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
   * Update an app setting
   */
  static async update(id: number, setting: SettingData): Promise<Setting> {
    const prompt = 'AppSettingRepository.update function says:';
    logger.info(`${prompt} Starting...`);
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
   * Delete an app setting
   */
  static async delete(id: number): Promise<Setting> {
    const prompt = 'AppSettingRepository.delete function says:';
    logger.info(`${prompt} Starting...`);
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