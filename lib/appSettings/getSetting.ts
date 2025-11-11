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
  logger.info(`${prompt} Fetched app setting from prisma.appSetting.findUnique with where: { key: ${key} }...`);
  logger.debug({ appSetting }, "App Setting");
  logger.info(`${prompt} Returning ${appSetting?.value ?? null} from getAppSettingByKey function.`);
  return appSetting?.value ?? null
}
