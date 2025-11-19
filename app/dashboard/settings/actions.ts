"use server";

import { prisma } from "@/lib/prisma";
import pino from "pino";

const logger = pino({ name: 'AppSettings' });

export async function getSettings() {
  logger.info('getSettings function says: Starting...');
  logger.info('getSettings function says: Invoking prisma.appSetting.findMany...');
  const settings = await prisma.appSetting.findMany({
    orderBy: { id: "asc" },
  });
  logger.info('getSettings function says: Invocation of prisma.appSetting.findMany function successfully completed.');
  logger.info(`getSettings function says: Returning ${settings.length} settings to the caller.`);
  return settings;
}

export async function createSetting(data: { key: string; value: string }) {
  logger.info('createSetting function says: Starting...');
  logger.info('createSetting function says: Invoking prisma.appSetting.create...');
  const setting = await prisma.appSetting.create({ data });
  logger.info('createSetting function says: Invocation of prisma.appSetting.create function successfully completed.');
  logger.info(`createSetting function says: Returning setting with ID: ${setting.id} to the caller.`);
  return setting;
}

export async function updateSetting(id: number, data: { key: string; value: string }) {
  logger.info('updateSetting function says: Starting...');
  logger.info('updateSetting function says: Invoking prisma.appSetting.update...');
  const setting = await prisma.appSetting.update({ where: { id }, data });
  logger.info('updateSetting function says: Invocation of prisma.appSetting.update function successfully completed.');
  logger.info(`updateSetting function says: Returning setting with ID: ${setting.id} to the caller.`);
  return setting;
}

export async function deleteSetting(id: number) {
  logger.info('deleteSetting function says: Starting...');
  logger.info('deleteSetting function says: Invoking prisma.appSetting.delete...');
  const setting = await prisma.appSetting.delete({ where: { id } });
  logger.info('deleteSetting function says: Invocation of prisma.appSetting.delete function successfully completed.');
  logger.info(`deleteSetting function says: Returning setting with ID: ${setting.id} to the caller.`);
  return setting;
}
