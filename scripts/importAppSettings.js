// scripts/importAppSettings.js

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// Carga y parsea un archivo YAML
function loadYaml(env) {
  const filePath = path.join(__dirname, '..', 'lib', 'config', `${env}.yaml`);
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

// Convierte objeto a entries recursivamente con claves en formato key.subkey
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

async function importSettings(env) {
  const data = loadYaml(env);
  const flatEntries = flatten(data);

  for (const [key, value] of flatEntries) {
    await prisma.appSetting.upsert({
      where: {
        env_key: {
          env,
          key
        }
      },
      update: { value },
      create: {
        env,
        key,
        value
      }
    });
  }

  console.log(`✔ Imported ${flatEntries.length} settings for ${env}`);
}

async function main() {
  await importSettings('prod');
  await importSettings('test');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
