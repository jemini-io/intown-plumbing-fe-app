const fs = require('fs');
const path = require('path');
const pino = require("pino");
const yaml = require('js-yaml');
const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

const logger = pino({ name: "ImportAppSettings" });

// Get environment from command-line argument
const env = process.argv[2]; // 'prod' or 'test'

if (!env) {
  logger.error('You must pass the environment name (e.g., prod or test).');
  process.exit(1);
}

// Load and parse a YAML file
function loadYaml(env) {
  const filePath = path.join(__dirname, '..', 'lib', 'config', `${env}.yaml`);
  if (!fs.existsSync(filePath)) {
    console.error(`YAML file not found: ${filePath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

// Flatten nested objects into dot.notation keys
function flatten(obj, parentKey = '') {
  const entries = [];

  for (const key in obj) {
    const value = obj[key];
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (Array.isArray(value)) {
      entries.push([fullKey, JSON.stringify(value)]);
    } else if (typeof value === 'object' && value !== null) {
      entries.push(...flatten(value, fullKey));
    } else {
      entries.push([fullKey, String(value)]);
    }
  }

  return entries;
}

// Import settings into the database
async function importSettings(env) {
  const data = loadYaml(env);
  const flatEntries = flatten(data);

  for (const [key, value] of flatEntries) {
    await prisma.appSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  console.log(`✅ Imported ${flatEntries.length} settings for the ${env} env`);
}

// Run the script
async function main() {
  await importSettings(env);
  await prisma.$disconnect();
}

main().catch((err) => {
  logger.error(err, `❌ Error while importing App Settings for the ${env} env`);
  prisma.$disconnect();
  process.exit(1);
});
