import fs from 'fs';
import path from 'path';
import pino from "pino";
import { PrismaClient } from '../lib/generated/prisma';
import { addEmailAddress } from '../app/dashboard/emailAddresses/actions';
import { addPhoneNumber } from '../app/dashboard/phoneNumbers/actions';

const prisma = new PrismaClient();

const logger = pino({ name: "ImportBookingsFixtures" });

// Get environment from command-line argument
const env = process.argv[2]; // 'prod' or 'test'

if (!env) {
  logger.error('You must pass the environment name (e.g., prod or test).');
  process.exit(1);
}

// Load and parse a JSON fixture file
function loadJsonFixture(filename: string) {
  const filePath = path.join(__dirname, '..', 'prisma', 'fixtures', filename);
  if (!fs.existsSync(filePath)) {
    logger.error(`JSON file not found: ${filePath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

// 1. Import email addresses and build a map: { fixtureId: prismaId }
async function importEmailAddressesAndGetMap() {
  const emailAddresses = loadJsonFixture('emailAddresses.json') as Array<{ id?: string; address: string }>;
  if (!Array.isArray(emailAddresses)) {
    logger.error('emailAddresses.json is not an array.');
    process.exit(1);
  }
  
  let count = 0;
  const emailMap: Record<string, string> = {};
  
  for (const email of emailAddresses) {
    const emailData = { ...email };
    const fixtureId = emailData.id;
    if (!fixtureId) {
      logger.error('Email address missing id in fixture');
      process.exit(1);
    }
    delete emailData.id;

    // Use addEmailAddress which includes validation
    const created = await addEmailAddress({ address: emailData.address });
    emailMap[fixtureId] = created.id;
    count++;
  }
  
  logger.info(`✅ Imported ${count} EmailAddress records for the ${env} env`);
  return emailMap;
}

// 2. Import phone numbers and build a map: { fixtureId: prismaId }
async function importPhoneNumbersAndGetMap() {
  const phoneNumbers = loadJsonFixture('phoneNumbers.json') as Array<{ id?: string; countryCode: string; number: string }>;
  if (!Array.isArray(phoneNumbers)) {
    logger.error('phoneNumbers.json is not an array.');
    process.exit(1);
  }
  
  let count = 0;
  const phoneMap: Record<string, string> = {};
  
  for (const phone of phoneNumbers) {
    const phoneData = { ...phone };
    const fixtureId = phoneData.id;
    if (!fixtureId) {
      logger.error('Phone number missing id in fixture');
      process.exit(1);
    }
    delete phoneData.id;
    
    // Use addPhoneNumber which includes sanitization of countryCode
    const created = await addPhoneNumber({
      countryCode: phoneData.countryCode,
      number: phoneData.number,
    });
    phoneMap[fixtureId] = created.id;
    count++;
  }
  
  logger.info(`✅ Imported ${count} PhoneNumber records for the ${env} env`);
  return phoneMap;
}

// 3. Import customers using email and phone maps, build customer map: { customerId (ServiceTitan): prismaId }
async function importCustomersAndGetMap(emailMap: Record<string, string>, phoneMap: Record<string, string>) {
  const customers = loadJsonFixture('customers.json') as Array<{
    id?: string;
    customerId: number;
    name: string;
    type?: string;
    emailAddressId?: string;
    phoneNumberId?: string;
    imageId?: string | null;
  }>;
  if (!Array.isArray(customers)) {
    logger.error('customers.json is not an array.');
    process.exit(1);
  }
  
  let count = 0;
  const customerMap: Record<number, string> = {}; // Maps ServiceTitan customerId to Prisma id
  
  for (const customer of customers) {
    const customerData = { ...customer };
    const serviceTitanCustomerId = customerData.customerId;
    delete customerData.id;
    
    // Resolve emailAddressId and phoneNumberId from maps
    if (customerData.emailAddressId) {
      const mappedEmailId = emailMap[customerData.emailAddressId];
      if (mappedEmailId) {
        customerData.emailAddressId = mappedEmailId;
        logger.debug(`Mapped email fixture ID ${customerData.emailAddressId} to Prisma ID ${mappedEmailId}`);
      } else {
        logger.warn(`Email fixture ID ${customerData.emailAddressId} not found in emailMap. Available keys: ${Object.keys(emailMap).join(', ')}`);
        customerData.emailAddressId = undefined;
      }
    } else {
      customerData.emailAddressId = undefined;
    }
    
    if (customerData.phoneNumberId) {
      const mappedPhoneId = phoneMap[customerData.phoneNumberId];
      if (mappedPhoneId) {
        customerData.phoneNumberId = mappedPhoneId;
        logger.debug(`Mapped phone fixture ID ${customerData.phoneNumberId} to Prisma ID ${mappedPhoneId}`);
      } else {
        logger.warn(`Phone fixture ID ${customerData.phoneNumberId} not found in phoneMap. Available keys: ${Object.keys(phoneMap).join(', ')}`);
        customerData.phoneNumberId = undefined;
      }
    } else {
      customerData.phoneNumberId = undefined;
    }
    
    // Remove id before creating, handle imageId separately
    const { imageId, ...createData } = customerData;
    const createInput = {
      ...createData,
      ...(imageId !== null && imageId !== undefined ? { imageId } : {}),
    };
    
    const created = await prisma.customer.create({ data: createInput as Parameters<typeof prisma.customer.create>[0]['data'] });
    customerMap[serviceTitanCustomerId] = created.id; // Map ServiceTitan ID to Prisma ID
    count++;
  }
  
  logger.info(`✅ Imported ${count} Customer records for the ${env} env`);
  return customerMap;
}

// Run the script
async function main() {
  try {
    logger.info("🧹 Deleting Booking records...");
    await prisma.booking.deleteMany();
    logger.info("🧹 Deleting Customer records...");
    await prisma.customer.deleteMany();
    logger.info("🧹 Deleting PhoneNumber records...");
    await prisma.phoneNumber.deleteMany();
    logger.info("🧹 Deleting EmailAddress records...");
    await prisma.emailAddress.deleteMany();

    const emailMap = await importEmailAddressesAndGetMap();
    const phoneMap = await importPhoneNumbersAndGetMap();
    await importCustomersAndGetMap(emailMap, phoneMap);
    
    await prisma.$disconnect();
    logger.info(`✅ Fixtures imported successfully for the ${env} env`);
  } catch (err) {
    logger.error({ err }, `❌ Error in main import for the ${env} env`);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();