// import { PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";
import pino from 'pino';
import { log } from "console";

const logger = pino({ name: "SeedScript" });

// const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme";
  log(`Seeding admin user with email: ${adminEmail} and password: ${adminPassword}`);

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
