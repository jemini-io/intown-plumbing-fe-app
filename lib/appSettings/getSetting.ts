import { PrismaClient } from '@/lib/generated/prisma'
const prisma = new PrismaClient()

export async function getSetting(key: string) {
  const setting = await prisma.appSetting.findUnique({
    where: { key }
  })
  return setting?.value ?? null
}
