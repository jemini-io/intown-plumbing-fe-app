import { prisma } from "@/lib/prisma";

export async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.appSetting.findUnique({
    where: { key }
  })
  return setting?.value ?? null
}
