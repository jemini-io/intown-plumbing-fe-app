import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinaryServer } from "@/lib/cloudinary/upload";
import { deleteFromCloudinary } from "@/lib/cloudinary/delete";
import { hashPassword } from "@/lib/auth/password";
import pino from "pino";
import { cleanupOldUserImage } from "@/lib/services/imageCleanupService";
import { cleanupCloudinaryImage } from "@/lib/services/cloudinaryCleanupService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const logger = pino({ name: "user-update-route" });

export async function POST(req: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    logger.warn("Unauthorized attempt to update user");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const userId = formData.get("id") as string;
  const imageFile = formData.get("image") as File | null;

  // 1. Find user to update
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: { image: true },
    });
    logger.info({ userEmail: user?.email }, "Fetched user for update");
  } catch (err) {
    logger.error({ userId, err }, "Error fetching user for update");
    return NextResponse.json({ error: "Error fetching user." }, { status: 500 });
  }

  let userImageId = user?.imageId;
  let newUserImage;
  let uploadedImage;

  // 2. Set up variables for image handling
  if (imageFile) { // 2.1. If new image is provided:
      // 2.2.1. Upload new image to Cloudinary
      try{      
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        uploadedImage = await uploadToCloudinaryServer(buffer);
        logger.info({ userId, uploadedImage }, "Image uploaded to Cloudinary");
      } catch(err) {
        logger.error({ err }, "Error uploading image to Cloudinary");
        return NextResponse.json({ error: "Error uploading image." }, { status: 500 });
      }

      // 2.2.2. Create new UserImage entry in DB
      try{
        newUserImage = await prisma.userImage.create({
          data: { url: uploadedImage.url, publicId: uploadedImage.publicId },
        });
        userImageId = newUserImage.id;
        logger.info({ userId, newUserImageId: newUserImage.id }, "Created new UserImage entry in DB");
      } catch(err) {
        logger.error({ err }, "Error creating UserImage entry in DB");
        
        // Rollback Cloudinary upload if DB entry creation fails
        logger.info({ userId, publicId: uploadedImage.publicId }, "Rolling back Cloudinary upload due to DB error")
        cleanupCloudinaryImage(uploadedImage.publicId);

        return NextResponse.json({ error: "Error creating image entry." }, { status: 500 });
      }
  } else { // 2.2. If image removal is requested:
    const removeImage = formData.get("removeImage") === "true";
    if (removeImage && user?.image?.publicId) {
      try {
        // 2.2.1. Set user's image reference to null
        userImageId = null;

        // Delegate the image cleanup to background task
        logger.info({ userId }, "Delegating image cleanup to background...");
        cleanupOldUserImage(userId, user.image.id, user.image.publicId);

      } catch (err) {
        logger.error({ userId, err }, "Error removing image");
        return NextResponse.json({ error: "Error removing image." }, { status: 500 });
      }
    }
  }

  // 4. Update user details
  const updateData: {
    name: string;
    email: string;
    role: string;
    passwordDigest?: string;
    image?: { connect: { id: string } } | { disconnect: true };
  } = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    role: formData.get("role") as string,
  };

  if (userImageId) {
    updateData.image = { connect: { id: userImageId } };
  } else if (imageFile === null || userImageId === null) {
    updateData.image = { disconnect: true };
  }

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
    logger.info({ userEmail: user?.email }, "User updated successfully");

    // 5. If new image was uploaded and user had an old image, delete the old image
    if (imageFile && user?.image?.publicId && user?.image?.id) {
      logger.info({ userEmail: user?.email }, "Delegating old image cleanup to background...");
      cleanupOldUserImage(userId, user.image.id, user.image.publicId);
    }

    logger.info("Response returned to frontend");
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error({ userId, err }, "Error updating user");
    // Cleanup if new image was uploaded but user update failed
    if (uploadedImage?.publicId) {
      await deleteFromCloudinary(uploadedImage.publicId);
      logger.info({ userId, publicId: uploadedImage.publicId }, "Rolled back new image from Cloudinary");
      if (newUserImage?.id) {
        await prisma.userImage.delete({ where: { id: newUserImage.id } });
        logger.info({ userId, imageId: newUserImage.id }, "Rolled back new UserImage entry");
      }
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}