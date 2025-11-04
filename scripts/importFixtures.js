const fs = require('fs');
const path = require('path');
const pino = require("pino");
const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

const logger = pino({ name: "ImportBookingsFixtures" });

// Get environment from command-line argument
const env = process.argv[2]; // 'prod' or 'test'

if (!env) {
  logger.error('You must pass the environment name (e.g., prod or test).');
  process.exit(1);
}

// Load and parse a JSON fixture file
function loadJsonFixture(filename) {
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
  const emailAddresses = loadJsonFixture('emailAddresses.json');
  if (!Array.isArray(emailAddresses)) {
    logger.error('emailAddresses.json is not an array.');
    process.exit(1);
  }
  
  let count = 0;
  const emailMap = {};
  
  for (const email of emailAddresses) {
    const emailData = { ...email };
    const fixtureId = emailData.id;
    delete emailData.id;
    
    const created = await prisma.emailAddress.create({ data: emailData });
    emailMap[fixtureId] = created.id;
    count++;
  }
  
  logger.info(`✅ Imported ${count} EmailAddress records for the ${env} env`);
  return emailMap;
}

// 2. Import phone numbers and build a map: { fixtureId: prismaId }
async function importPhoneNumbersAndGetMap() {
  const phoneNumbers = loadJsonFixture('phoneNumbers.json');
  if (!Array.isArray(phoneNumbers)) {
    logger.error('phoneNumbers.json is not an array.');
    process.exit(1);
  }
  
  let count = 0;
  const phoneMap = {};
  
  for (const phone of phoneNumbers) {
    const phoneData = { ...phone };
    const fixtureId = phoneData.id;
    delete phoneData.id;
    
    const created = await prisma.phoneNumber.create({ data: phoneData });
    phoneMap[fixtureId] = created.id;
    count++;
  }
  
  logger.info(`✅ Imported ${count} PhoneNumber records for the ${env} env`);
  return phoneMap;
}

// 3. Import customers using email and phone maps, build customer map: { customerId (ServiceTitan): prismaId }
async function importCustomersAndGetMap(emailMap, phoneMap) {
  const customers = loadJsonFixture('customers.json');
  if (!Array.isArray(customers)) {
    logger.error('customers.json is not an array.');
    process.exit(1);
  }
  
  let count = 0;
  const customerMap = {}; // Maps ServiceTitan customerId to Prisma id
  
  for (const customer of customers) {
    const customerData = { ...customer };
    const serviceTitanCustomerId = customerData.customerId;
    delete customerData.id;
    
    // Resolve emailAddressId and phoneNumberId from maps
    if (customerData.emailAddressId && emailMap[customerData.emailAddressId]) {
      customerData.emailAddressId = emailMap[customerData.emailAddressId];
    } else {
      customerData.emailAddressId = null;
    }
    
    if (customerData.phoneNumberId && phoneMap[customerData.phoneNumberId]) {
      customerData.phoneNumberId = phoneMap[customerData.phoneNumberId];
    } else {
      customerData.phoneNumberId = null;
    }
    
    const created = await prisma.customer.create({ data: customerData });
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
