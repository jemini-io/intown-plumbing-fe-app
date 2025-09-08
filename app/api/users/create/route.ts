import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinaryServer, deleteFromCloudinary } from "@/lib/cloudinary";
import pino from "pino";

const logger = pino({ name: "user-create-route" });

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "USER" | "ADMIN";
  const imageFile = formData.get("image") as File | null;

  let uploadedImage = null;
  let userImage = null;
  let user = null;

  // 1. Create just the user (without an associated image)
  try {
    user = await prisma.user.create({
      data: {
        email,
        name,
        passwordDigest: password,
        role,
      },
    });

    logger.info({
      name: user.name,
      email: user.email,
      role: user.role
    }, "User created successfully");

  } catch (err) {
    logger.error(err, "Error creating user:");
    return NextResponse.json({ error: "Error creating user." }, { status: 500 });
  }

  // 2. If image is provided:
  if (imageFile) {
    // 2.1. Upload to Cloudinary
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      uploadedImage = await uploadToCloudinaryServer(buffer);

      logger.info({
        user: user.name,
        ...uploadedImage
      }, "Image uploaded successfully");

    } catch (err) {
      logger.error(err, "Error uploading image to Cloudinary:");

      logger.info({
        userId: user.id
      }, "Deleting user due to image upload failure");
      await prisma.user.delete({ where: { id: user.id } });

      return NextResponse.json({ error: "Error uploading image." }, { status: 500 });
    }

    // 2.2. Create UserImage entry and associate it to user
    try {
      userImage = await prisma.userImage.create({
        data: {
          url: uploadedImage.url,
          publicId: uploadedImage.publicId,
          user: { connect: { id: user.id } },
        },
      });

      logger.info("Updating user to associate image");
      await prisma.user.update({
        where: { id: user.id },
        data: { imageId: userImage.id },
      });
    } catch (err) {

      logger.info(user.id, "Deleting user due to userImage creation failure");
      
      if (uploadedImage?.publicId) {
        await deleteFromCloudinary(uploadedImage.publicId);
      }
      if (userImage?.id) {
        await prisma.userImage.delete({ where: { id: userImage.id } });
      }

      await prisma.user.delete({ where: { id: user.id } });

      logger.error(err, "Error creating userImage or updating user:");

      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  }

  return NextResponse.json({ user });
}