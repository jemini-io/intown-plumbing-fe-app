"use server";

import { AppSettingRepository } from "@/lib/repositories";
import type { SettingData } from "@/lib/repositories/appSettings/AppSettingRepository";
import pino from "pino";

const logger = pino({ name: 'AppSettings' });

export async function getAllAppSettings() {
  const prompt = 'getAllAppSettings function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking AppSettingRepository.findAll function...`);
  const settings = await AppSettingRepository.findAll();
  logger.info(`${prompt} Invocation of AppSettingRepository.findAll function successfully completed.`);
  logger.info(`${prompt} Returning ${settings.length} settings to the caller.`);
  return settings;
}

export async function createAppSetting(data: SettingData) {
  const prompt = 'createAppSetting function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking AppSettingRepository.create function...`);
  const setting = await AppSettingRepository.create(data);
  logger.info(`${prompt} Invocation of AppSettingRepository.create function successfully completed.`);
  logger.info(`${prompt} Returning setting with ID: ${setting.id} to the caller.`);
  return setting;
}

export async function updateAppSetting(id: number, data: SettingData) {
  const prompt = 'updateAppSetting function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking AppSettingRepository.update function...`);
  const setting = await AppSettingRepository.update(id, data);
  logger.info(`${prompt} Invocation of AppSettingRepository.update function successfully completed.`);
  logger.info(`${prompt} Returning setting with ID: ${setting.id} to the caller.`);
  return setting;
}

export async function deleteAppSetting(id: number) {
  const prompt = 'deleteAppSetting function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking AppSettingRepository.delete function...`);
  const setting = await AppSettingRepository.delete(id);
  logger.info(`${prompt} Invocation of AppSettingRepository.delete function successfully completed.`);
  logger.info(`${prompt} Returning setting with ID: ${setting.id} to the caller.`);
  return setting;
}
