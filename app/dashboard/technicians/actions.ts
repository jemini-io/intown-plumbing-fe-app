"use server";

import { prisma } from "@/lib/prisma";
import { TechnicianToSkillsType } from "@/lib/types/technicianToSkillsType";
import pino from "pino";

const logger = pino({ name: "technicianToSkills-actions" });

export async function getTechnicianToSkillsSetting() {
  return await prisma.appSetting.findUnique({
    where: { key: "technicianToSkills" },
  });
}

// Find a technician by ID
export async function findTechnicianById(technicianId: string): Promise<TechnicianToSkillsType | undefined> {
  const technicianToSkillsSetting = await getTechnicianToSkillsSetting();
  const technicians = technicianToSkillsSetting ? JSON.parse(technicianToSkillsSetting.value) as TechnicianToSkillsType[] : [];
  return technicians.find((t) => t.technicianId === technicianId);
}

// Add a new technician
export async function addTechnician(newTechnician: TechnicianToSkillsType): Promise<TechnicianToSkillsType[]> {
  const technicianToSkillsSetting = await getTechnicianToSkillsSetting();
  const technicians = technicianToSkillsSetting ? JSON.parse(technicianToSkillsSetting.value) as TechnicianToSkillsType[] : [];
  technicians.push(newTechnician);
  await prisma.appSetting.update({
    where: { key: "technicianToSkills" },
    data: { value: JSON.stringify(technicians) },
  });
  return technicians;
}

// Update an existing technician
export async function updateTechnician(technicianId: string, updated: Partial<TechnicianToSkillsType>): Promise<TechnicianToSkillsType[]> {
  const technicianToSkillsSetting = await getTechnicianToSkillsSetting();
  const technicians = technicianToSkillsSetting ? JSON.parse(technicianToSkillsSetting.value) as TechnicianToSkillsType[] : [];
  const idx = technicians.findIndex((t) => t.technicianId === technicianId);
  if (idx === -1) return technicians;
  technicians[idx] = { ...technicians[idx], ...updated };
  await prisma.appSetting.update({
    where: { key: "technicianToSkills" },
    data: { value: JSON.stringify(technicians) },
  });
  return technicians;
}

// Delete a technician by technicianID
export async function deleteTechnician(technicianId: string): Promise<TechnicianToSkillsType[]> {
  logger.info(`Deleting technician with ID: ${technicianId}`);
  const technicianToSkillsSetting = await getTechnicianToSkillsSetting();
  const technicians = technicianToSkillsSetting ? JSON.parse(technicianToSkillsSetting.value) as TechnicianToSkillsType[] : [];
  const filtered = technicians.filter((t) => t.technicianId !== technicianId);
  await prisma.appSetting.update({
    where: { key: "technicianToSkills" },
    data: { value: JSON.stringify(filtered) },
  });
  return filtered;
}