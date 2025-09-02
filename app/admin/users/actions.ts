"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export type UserData = {
  email: string;
  name: string;
  password?: string;
  role: "USER" | "ADMIN";
};

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
}

export async function createUser(data: UserData) {
  const hashedPassword = data.password
    ? await bcrypt.hash(data.password, 10)
    : undefined;

  await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordDigest: hashedPassword || "",
      role: data.role,
    },
  });
}

export async function updateUser(id: number, data: Partial<UserData>) {
  const updateData: any = { ...data };
  if (data.password) {
    updateData.passwordDigest = await bcrypt.hash(data.password, 10);
    delete updateData.password;
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteUser(id: number) {
  await prisma.user.delete({ where: { id } });
}
