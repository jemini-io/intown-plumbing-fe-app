"use server";

import { prisma } from "@/lib/prisma";
import { ServiceToJobType } from "@/lib/types/serviceToJobType";
import { TechnicianToSkillsType } from "@/lib/types/technicianToSkillsType";

export async function getServiceToJobTypes(): Promise<ServiceToJobType[]> {
  const settings = await prisma.appSetting.findUnique({
    where: { key: "serviceToJobTypes" },
  });
  if (!settings?.value) return [];
  try {
    return JSON.parse(settings.value) as ServiceToJobType[];
  } catch {
    return [];
  }
}

export async function getTechniciansToSkills(): Promise<TechnicianToSkillsType[]> {
  const technicians = await prisma.appSetting.findUnique({
    where: { key: "technicianToSkills" },
  });
  if (!technicians?.value) return [];
  try {
    return JSON.parse(technicians.value) as TechnicianToSkillsType[];
  } catch {
    return [];
  }
}