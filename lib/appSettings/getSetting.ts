import { prisma } from "@/lib/prisma";
import pino from "pino";

const logger = pino({ name: 'AppSettings' });

export async function getAppSettingByKey(key: string): Promise<string | null> {
  const prompt = 'getAppSettingByKey function says:';
  logger.info(`${prompt} Starting...`);
  logger.info(`${prompt} Invoking prisma.appSetting.findUnique with where: { key: ${key} }...`);
  const appSetting = await prisma.appSetting.findUnique({
    where: { key }
  })
  logger.info(`${prompt} Invocation of prisma.appSetting.findUnique function successfully completed.`);

  if (!appSetting) {
    logger.info(`${prompt} App setting not found. Returning null to the caller.`);
    return null;
  }

  logger.info(`${prompt} Returning app setting to the caller.`);
  logger.debug({ appSetting }, `App Setting "${key}`);
  return appSetting.value
}
