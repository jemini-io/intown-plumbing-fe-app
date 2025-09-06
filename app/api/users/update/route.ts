import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinaryServer } from "@/lib/cloudinary/upload";
import { deleteFromCloudinary } from "@/lib/cloudinary/delete";
import { hash } from "crypto";
import { hashPassword } from "@/lib/auth/password";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const userId = formData.get("id") as string;
  const imageFile = formData.get("image") as File | null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { image: true },
  });

  let userImageId = user?.imageId;

  if (imageFile) {
    if (user?.image?.publicId) {
      await deleteFromCloudinary(user.image.publicId);
      await prisma.userImage.delete({ where: { id: user.image.id } });
    }
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const { url, publicId } = await uploadToCloudinaryServer(buffer);
    const newImage = await prisma.userImage.create({
      data: { url, publicId },
    });
    userImageId = newImage.id;
  } else {
    const removeImage = formData.get("removeImage") === "true";
    if (removeImage && user?.image?.publicId) {
      await deleteFromCloudinary(user.image.publicId);
      await prisma.userImage.delete({ where: { id: user.image.id } });
      await prisma.user.update({
        where: { id: userId },
        data: { imageId: null },
      });
      userImageId = null;
    }
  }

  const updateData: {
    imageId: string | null | undefined;
    name: string;
    email: string;
    role: string;
    passwordDigest?: string;
  } = {
    imageId: userImageId,
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    role: formData.get("role") as string,
  };

  const password = formData.get("password") as string;
  if (password) {
    updateData.passwordDigest = await hashPassword(password);
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return NextResponse.json({ success: true });
}