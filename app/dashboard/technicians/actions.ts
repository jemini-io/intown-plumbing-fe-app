"use server";

import { prisma } from "@/lib/prisma";
import { TechnicianToSkills } from "@/lib/types/technicianToSkills";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import pino from "pino";

const logger = pino({ name: "technician-actions" });

export async function getAllTechnicians() {
  try {
    const prompt = "getAllTechnicians function says:";  
    logger.info(`${prompt} Starting...`);
    const technicians = await prisma.technician.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        skills: {
          include: { skill: true },
        },
        image: true,
      },
    });
    logger.info(`${prompt} Successfully completed. Returning array of ${technicians.length} technicians.`);
    return technicians.map(tech => ({
      ...tech,
      skills: tech.skills.map(rel => rel.skill),
      status: tech.status as TechnicianToSkills["status"],
    }));
  } catch (error) {
    logger.error({ error }, `${prompt} Error running getAllTechnicians function:`);
    throw error;
  }
}

// Optimized function for dropdowns - only fetches id, technicianName, and enabled
export async function getTechniciansForDropdown() {
  return prisma.technician.findMany({
    where: {
      enabled: true,
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      technicianName: true,
      enabled: true,
    },
  });
}

export async function findTechnicianById(id: string) {
  const prompt = "findTechnicianById function says:";
  logger.info(`${prompt} Fetching technician with ID: ${id}`);
  const technician = await prisma.technician.findUnique({
    where: { id },
    include: {
      skills: {
        include: { skill: true },
      },
      image: true,
    },
  });

  if (!technician) return null;
  return {
    ...technician,
    skills: technician.skills.map(rel => rel.skill),
    status: technician.status as TechnicianToSkills["status"],
  };
}

// export async function addTechnician(
//   data: Omit<TechnicianToSkills, "id" | "skills"> & { skillIds?: string[] }
// ) {
//   const prompt = "addTechnician function says:";
//   logger.info(`${prompt} Starting...`);

//   const { skillIds, ...technicianData } = data;
//   logger.info({ technicianData }, `${prompt} Invoking prisma.technician.create with data:`);
//   const createdTechnician = await prisma.technician.create({ data: technicianData });

//   if (skillIds && skillIds.length > 0) {
//     await prisma.technicianSkill.createMany({
//       data: skillIds.map(skillId => ({
//         technicianId: createdTechnician.id,
//         skillId,
//       })),
//       skipDuplicates: true,
//     });
//   }

//   return createdTechnician;
// }

// export async function updateTechnician(
//   id: string,
//   data: Partial<Omit<TechnicianToSkills, "skills">> & { skillIds?: string[] }
// ) {
//   logger.info(`Updating technician with ID: ${id}`);
//   const { skillIds, ...technicianData } = data;

//   const updatedTechnician = await prisma.technician.update({
//     where: { id },
//     data: technicianData,
//   });

//   if (skillIds) {
//     await prisma.technicianSkill.deleteMany({
//       where: { technicianId: id },
//     });
//     await prisma.technicianSkill.createMany({
//       data: skillIds.map(skillId => ({
//         technicianId: id,
//         skillId,
//       })),
//       skipDuplicates: true,
//     });
//   }

//   return updatedTechnician;
// }

export async function deleteTechnician(id: string) {
  const prompt = "deleteTechnician function says:";
  logger.info(`${prompt} Starting...`);

  logger.info(`${prompt} Fetching technician with ID: ${id} to retrieve associated image...`);
  const technician = await prisma.technician.findUnique({
    where: { id },
    include: { image: true },
  });

  if (!technician) {
    logger.warn(`${prompt} Technician with ID: ${id} not found. Skipping delete.`);
    return;
  }

  // Delete image from Cloudinary if it exists
  logger.info(`${prompt} Deleting image from Cloudinary if it exists...`);
  if (technician.image?.publicId) {
    await deleteFromCloudinary(technician.image.publicId);
  }

  // Delete associated UserImage entry if it exists
  logger.info(`${prompt} Deleting associated image from UserImage table entry if it exists...`);
  if (technician.image?.id) {
    await prisma.image.delete({ where: { id: technician.image.id } });
  }

  // Delete TechnicianSkill relations
  logger.info(`${prompt} Deleting TechnicianSkill relations...`);
  await prisma.technicianSkill.deleteMany({ where: { technicianId: id } });

  // Delete the technician itself
  logger.info(`${prompt} Deleting technician with ID: ${id} from database...`);
  await prisma.technician.delete({ where: { id } });
}

export async function unlinkSkillFromTechnician(technicianId: string, skillId: string) {
  await prisma.technicianSkill.delete({
    where: { technicianId_skillId: { technicianId, skillId } },
  });
}
