const fs = require('fs');
const path = require('path');
const pino = require("pino");
const yaml = require('js-yaml');
const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

const logger = pino({ name: "ImportSkillsTechniciansAndServiceToJobTypes" });

// Get environment from command-line argument
const env = process.argv[2]; // 'prod' or 'test'

if (!env) {
  logger.error('You must pass the environment name (e.g., prod or test).');
  process.exit(1);
}

// Set directory based on environment
const configDir =
  env === "test"
    ? path.join(__dirname, '..', 'lib', 'config', 'appSettings', 'testEnv')
    : path.join(__dirname, '..', 'lib', 'config', 'appSettings', 'prodEnv');


// Load and parse a YAML file from the configDir
function loadYaml(filename) {
  const filePath = path.join(configDir, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`YAML file not found: ${filePath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

// 1. Import skills and build a map: { name: skill.id }
async function importSkillsAndGetMap() {
  const data = loadYaml('skills.yaml');
  const skills = data.skills;
  if (!Array.isArray(skills)) {
    logger.error('skills key not found or not an array in YAML.');
    process.exit(1);
  }
  let count = 0;
  const skillMap = {};
  for (const skill of skills) {
    const skillData = { ...skill };
    delete skillData.id;
    const created = await prisma.skill.create({ data: skillData });
    skillMap[skill.id] = created.id; // Usa el id del YAML como clave
    count++;
  }
  logger.info(`✅ Imported ${count} Skill records for the ${env} env`);
  return skillMap;
}

// 2. Import services and relate skills by name
async function importServiceToJobTypes(skillMap) {
  const data = loadYaml('serviceToJobTypes.yaml');
  const serviceToJobTypes = data.serviceToJobTypes;
  if (!Array.isArray(serviceToJobTypes)) {
    logger.error('serviceToJobTypes key not found or not an array in YAML.');
    process.exit(1);
  }
  let count = 0;
  for (const svc of serviceToJobTypes) {
    const svcData = { ...svc };
    delete svcData.id;
    const { skills, ...serviceFields } = svcData;
    const service = await prisma.serviceToJobType.create({ data: serviceFields });
    if (Array.isArray(skills)) {
      for (const skillIdOrName of skills) {
        const skillId = skillMap[skillIdOrName] || skillMap[skillIdOrName.trim()];
        if (skillId) {
          await prisma.serviceToJobTypeSkill.create({
            data: {
              serviceToJobTypeId: service.id,
              skillId: skillId
            }
          });
          logger.info(`🔗 Linked skill ${skillIdOrName} to service ${service.displayName}`);
        } else {
          logger.error(`Skill not found for service: ${service.displayName}, skill: ${skillIdOrName}`);
        }
      }
    }
    count++;
  }
  logger.info(`✅ Imported ${count} ServiceToJobType records and their skills for the ${env} env`);
}

// 3. Import technicians and relate skills by name
async function importTechniciansToSkills(skillMap) {
  const data = loadYaml('technicians.yaml');
  const technicians = data.technicianToSkills;

  if (!Array.isArray(technicians)) {
    logger.error('technicianToSkills key not found or not an array in YAML.');
    process.exit(1);
  }

  let count = 0;
  for (const tech of technicians) {
    const techData = { ...tech };
    delete techData.id;
    const { skills, ...technicianFields } = techData;

    const technician = await prisma.technician.create({
      data: technicianFields
    });

    if (Array.isArray(skills)) {
      for (const skillId of skills) {
        await prisma.technicianSkill.create({
          data: {
            technicianId: technician.id,
            skillId: skillMap[skillId]
          }
        });
        logger.info(`🔗 Linked skill ${skillId} to technician ${technician.technicianName}`);
      }
    }
    count++;
  }

  logger.info(`✅ Imported ${count} Technician records and their skills for the ${env} env`);
}

// Run the script
async function main() {
  try {
    logger.info("🧹 Deleting TechnicianSkill records...");
    await prisma.technicianSkill.deleteMany();
    logger.info("🧹 Deleting ServiceToJobTypeSkill records...");
    await prisma.serviceToJobTypeSkill.deleteMany();
    logger.info("🧹 Deleting Technician records...");
    await prisma.technician.deleteMany();
    logger.info("🧹 Deleting ServiceToJobType records...");
    await prisma.serviceToJobType.deleteMany();
    logger.info("🧹 Deleting Skill records...");
    await prisma.skill.deleteMany();

    const skillMap = await importSkillsAndGetMap();
    await importServiceToJobTypes(skillMap);
    await importTechniciansToSkills(skillMap);
    await prisma.$disconnect();
  } catch (err) {
    logger.error({ err }, `❌ Error in main import for the ${env} env`);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
