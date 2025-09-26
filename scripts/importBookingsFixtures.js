const fs = require("node:fs");
const path = require("node:path");
const pino = require("pino");
const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

const logger = pino({ name: "ImportBookingsFixtures" });

function isBookingFixture(v) {
  if (typeof v !== "object" || v === null) return false;
  return (
    typeof v.scheduledFor === "string" &&
    typeof v.customerId === "string" &&
    typeof v.jobId === "string" &&
    typeof v.serviceId === "string" &&
    typeof v.technicianId === "string" &&
    typeof v.status === "string" &&
    typeof v.notes === "string"
  );
}

function resolveScheduledFor(val) {
  if (typeof val !== "string") return val;
  if (val === "$NOW") return new Date().toISOString();
  const m = /^\$NOW([+-]\d+)([dhm])$/.exec(val);
  if (!m) return val;
  const amount = parseInt(m[1], 10);
  const unit = m[2];
  const d = new Date();
  if (unit === "d") d.setUTCDate(d.getUTCDate() + amount);
  else if (unit === "h") d.setUTCHours(d.getUTCHours() + amount);
  else if (unit === "m") d.setUTCMinutes(d.getUTCMinutes() + amount);
  return d.toISOString();
}

async function run() {
  const env = process.env.APP_ENV || process.argv[2] || "test";
  if (env !== "test") {
    logger.info({ env }, "Skipping populating bookings table with fixtures (only for test env)");
    return;
  }

  const file = path.join(process.cwd(), "prisma/fixtures/bookings.json");
  if (!fs.existsSync(file)) {
    logger.warn({ file }, "File not found");
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch (e) {
    logger.error(e, "Invalid JSON");
    return;
  }

  if (!Array.isArray(parsed)) {
    logger.error("Fixture not an array");
    return;
  }

  const items = parsed.filter(isBookingFixture);
  logger.info({ total: parsed.length, valid: items.length, env }, "Importing Booking fixtures for the test env...📥");

  for (const b of items) {
    try {
      const scheduledISO = resolveScheduledFor(b.scheduledFor);

      await prisma.booking.upsert({
        where: { jobId: b.jobId },
        update: {},
        create: {
          scheduledFor: new Date(scheduledISO),
          customerId: b.customerId,
          jobId: b.jobId,
          serviceId: b.serviceId,
          technicianId: b.technicianId,
          status: b.status,
          notes: b.notes,
          revenue: typeof b.revenue === "number" ? b.revenue : 0,
        },
      });
    } catch (err) {
      logger.error({ jobId: b.jobId, err }, "Failed upsert");
    }
  }

  logger.info("✅ Booking Fixtures successfully imported for the test env!");
}

run()
  .catch(e => {
    logger.error(e, "❌ Error while importing Booking Fixtures for the test env");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });