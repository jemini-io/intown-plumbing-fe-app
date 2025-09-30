"use server";

import { prisma } from "@/lib/prisma";
import { TechnicianToSkillsType } from "@/lib/types/technicianToSkillsType";
import pino from "pino";

const logger = pino({ name: "technicianToSkills-actions" });

const TECHNICIAN_SETTING_KEY = "technicianToSkills";

export async function getTechnicianToSkillsSetting() {
  return prisma.appSetting.findUnique({ where: { key: TECHNICIAN_SETTING_KEY } });
}

export async function findTechnicianById(technicianId: string): Promise<TechnicianToSkillsType | undefined> {
  const setting = await getTechnicianToSkillsSetting();
  const list: TechnicianToSkillsType[] = setting?.value ? JSON.parse(setting.value) : [];
  return list.find(t => t.technicianId === technicianId);
}

export async function addTechnician(newTechnician: TechnicianToSkillsType): Promise<TechnicianToSkillsType[]> {
  const setting = await getTechnicianToSkillsSetting();
  const list: TechnicianToSkillsType[] = setting?.value ? JSON.parse(setting.value) : [];

  if (list.some(t => String(t.technicianId) === String(newTechnician.technicianId))) {
    throw new Error(`Technician ID "${newTechnician.technicianId}" already exists`);
  }

  list.push({
    technicianId: String(newTechnician.technicianId),
    technicianName: newTechnician.technicianName,
    skills: newTechnician.skills,
    enabled: newTechnician.enabled
  });

  await prisma.appSetting.upsert({
    where: { key: TECHNICIAN_SETTING_KEY },
    create: { key: TECHNICIAN_SETTING_KEY, value: JSON.stringify(list) },
    update: { value: JSON.stringify(list) }
  });

  return list;
}

export async function updateTechnician(
  originalTechnicianId: string,
  updated: Partial<TechnicianToSkillsType>
): Promise<TechnicianToSkillsType[]> {
  const setting = await getTechnicianToSkillsSetting();
  const list: TechnicianToSkillsType[] = setting?.value ? JSON.parse(setting.value) : [];

  const idx = list.findIndex(t => String(t.technicianId) === String(originalTechnicianId));
  if (idx === -1) return list;

  const current = list[idx];

  // Handle ID change
  let nextId = current.technicianId;
  if (updated.technicianId && String(updated.technicianId) !== String(originalTechnicianId)) {
    const collision = list.some(
      t => String(t.technicianId) === String(updated.technicianId)
    );
    if (collision) {
      throw new Error(`Technician ID "${updated.technicianId}" already exists`);
    }
    nextId = String(updated.technicianId);
  }

  const merged: TechnicianToSkillsType = {
    technicianId: nextId,
    technicianName: updated.technicianName ?? current.technicianName,
    skills: updated.skills ?? current.skills,
    enabled: updated.enabled ?? current.enabled
  };

  list[idx] = merged;

  await prisma.appSetting.upsert({
    where: { key: TECHNICIAN_SETTING_KEY },
    create: { key: TECHNICIAN_SETTING_KEY, value: JSON.stringify(list) },
    update: { value: JSON.stringify(list) }
  });

  return list;
}

export async function deleteTechnician(technicianId: string): Promise<TechnicianToSkillsType[]> {
  logger.info(`Deleting technician with ID: ${technicianId}`);
  const setting = await getTechnicianToSkillsSetting();
  const list: TechnicianToSkillsType[] = setting?.value ? JSON.parse(setting.value) : [];
  const filtered = list.filter(t => String(t.technicianId) !== String(technicianId));

  await prisma.appSetting.upsert({
    where: { key: TECHNICIAN_SETTING_KEY },
    create: { key: TECHNICIAN_SETTING_KEY, value: JSON.stringify(filtered) },
    update: { value: JSON.stringify(filtered) }
  });

  return filtered;
}
