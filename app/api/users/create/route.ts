import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinaryServer } from "@/lib/cloudinary/upload";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "USER" | "ADMIN";
  const imageFile = formData.get("image") as File | null;

  let userImageId: string | undefined = undefined;
  if (imageFile) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const { url, publicId } = await uploadToCloudinaryServer(buffer);
    const userImage = await prisma.userImage.create({
      data: {
        url,
        publicId,
      },
    });
    userImageId = userImage.id;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordDigest: password,
      role,
      imageId: userImageId,
    },
  });

  return NextResponse.json({ user });
}