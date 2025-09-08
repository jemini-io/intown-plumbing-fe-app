import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinaryServer } from "@/lib/cloudinary/upload";
import { deleteFromCloudinary } from "@/lib/cloudinary/delete";
import { hashPassword } from "@/lib/auth/password";
import pino from "pino";
import { cleanupOldUserImage } from "@/lib/services/imageCleanupService";

const logger = pino({ name: "user-update-route" });

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const userId = formData.get("id") as string;
  const imageFile = formData.get("image") as File | null;

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: { image: true },
    });
    logger.info({ userId }, "Fetched user for update");
  } catch (err) {
    logger.error({ userId, err }, "Error fetching user for update");
    return NextResponse.json({ error: "Error fetching user." }, { status: 500 });
  }

  let userImageId = user?.imageId;
  let newImage;
  let uploadedImage;

  // 1. If new image is provided:
  if (imageFile) {
    // 1.1. Upload new image to Cloudinary
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      uploadedImage = await uploadToCloudinaryServer(buffer);
      logger.info({ userId, uploadedImage }, "Image uploaded to Cloudinary");

      // 1.2. Create new UserImage entry in DB
      newImage = await prisma.userImage.create({
        data: { url: uploadedImage.url, publicId: uploadedImage.publicId },
      });
      logger.info({ userId, newImageId: newImage.id }, "Created new UserImage entry");

      userImageId = newImage.id;
    } catch (err) {
      logger.error({ userId, err }, "Error uploading new image or creating UserImage");
      return NextResponse.json({ error: "Error uploading image." }, { status: 500 });
    }
  } else {
    // 2. If image removal is requested:
    const removeImage = formData.get("removeImage") === "true";
    if (removeImage && user?.image?.publicId) {
      try {
        // Update user to remove image association
        await prisma.user.update({
          where: { id: userId },
          data: { imageId: null },
        });
        logger.info({ userId }, "Removed image at all from user");
        userImageId = null;

        // Delegate the image cleanup to background task
        logger.info({ userId }, "Delegating image cleanup to background...");
        cleanupOldUserImage(userId, user.image.id, user.image.publicId);

        logger.info({ userId }, "Returning response to frontend and delegating image cleanup to background");
        return NextResponse.json({ success: true });
      } catch (err) {
        logger.error({ userId, err }, "Error removing image");
        return NextResponse.json({ error: "Error removing image." }, { status: 500 });
      }
    }
  }

  // 3. Update user details
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
    try {
      updateData.passwordDigest = await hashPassword(password);
      logger.info({ userId }, "Password hashed for update");
    } catch (err) {
      logger.error({ userId, err }, "Error hashing password");
      return NextResponse.json({ error: "Error updating password." }, { status: 500 });
    }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    logger.info({ userId }, "User updated successfully");

    // 4. If new image was uploaded and user had an old image, delete the old image
    if (imageFile && user?.image?.publicId && user?.image?.id) {
      cleanupOldUserImage(userId, user.image.id, user.image.publicId);
    }

    logger.info({ userId }, "Returning response to frontend and delegating old image cleanup to background");
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error({ userId, err }, "Error updating user");
    // Cleanup if new image was uploaded but user update failed
    if (uploadedImage?.publicId) {
      await deleteFromCloudinary(uploadedImage.publicId);
      logger.info({ userId, publicId: uploadedImage.publicId }, "Rolled back new image from Cloudinary");
      if (newImage?.id) {
        await prisma.userImage.delete({ where: { id: newImage.id } });
        logger.info({ userId, imageId: newImage.id }, "Rolled back new UserImage entry");
      }
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}