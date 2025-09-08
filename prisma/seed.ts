import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";
import pino from 'pino';

const logger = pino({ name: "SeedScript" });

async function main() {
  const userEmail = "admin@example.com";
  const userPassword = process.env.ADMIN_PASSWORD || "changeme";
  const passwordDigest = await hashPassword(userPassword);
  const adminImage = await prisma.userImage.create({
    data: {
      url: "",
      publicId: "",
    },
  });

  // Upsert ensures we don't create duplicates
  const admin = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      passwordDigest,
      role: "ADMIN",
      imageId: adminImage.id,
    },
    create: {
      email: userEmail,
      name: "Admin user",
      passwordDigest,
      role: "ADMIN",
      imageId: adminImage.id,
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
