"use server";

import { prisma } from "@/lib/prisma";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      enabled: true,
    },
  });
}

export async function deleteUser(id: string) {
  // Find the user to get the associated image
  const user = await prisma.user.findUnique({
    where: { id },
    include: { image: true },
  });

  // Delete image from Cloudinary if it exists
  if (user?.image?.publicId) {
    await deleteFromCloudinary(user.image.publicId);
  }

  // Delete associated UserImage entry if it exists
  if (user?.image?.id) {
    await prisma.userImage.delete({ where: { id: user.image.id } });
  }

  // Delete the user itself
  await prisma.user.delete({ where: { id } });
}
