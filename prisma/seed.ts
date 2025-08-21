import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";
import pino from 'pino';

const logger = pino({ name: "SeedScript" });

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@example.com";
  const adminPassword = "12345678";

  // Hash the password
  const passwordDigest = await hashPassword(adminPassword);

  // Upsert ensures we don't create duplicates
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordDigest,
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      name: "Admin user",
      passwordDigest,
      role: "ADMIN",
    },
  });

  logger.info(admin, "✅ Admin user ready:");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    logger.error(e, "❌ Error seeding admin:");
    
    await prisma.$disconnect();
    process.exit(1);
  });
