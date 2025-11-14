import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinaryServer } from "@/lib/cloudinary/upload";
import { deleteFromCloudinary } from "@/lib/cloudinary/delete";
import pino from "pino";
import { cleanupOldUserImage } from "@/lib/services/imageCleanupService";
import { cleanupCloudinaryImage } from "@/lib/services/cloudinaryCleanupService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { statusToEnum } from "@/lib/types/technicianToSkills";
import { TechnicianStatusEnum } from "@/lib/types/technicianToSkills";

const logger = pino({ name: "technician-update-route" });

export async function POST(req: NextRequest) {
  const prompt = "technician-update-route function says:";
  logger.info(`${prompt} Starting...`);
  // 1. Check authentication. Technician updates require authentication.
  const session = await getServerSession(authOptions);
  if (!session) {
    logger.warn("Unauthorized attempt to update technician");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const id = formData.get("id") as string;
  const imageFile = formData.get("image") as File | null;

  // 2. Fetch existing technician
  logger.info(`${prompt} Checking if technician with ID: ${id} exists for update...`);
  let technician;
  try {
    logger.info(`${prompt} Invoking prisma.technician.findUnique function with ID: ${id}...`);
    technician = await prisma.technician.findUnique({
      where: { id },
      include: { image: true },
    });
    logger.info(`${prompt} Invocation of prisma.technician.findUnique function successfully completed.`);
    logger.info({ technicianName: technician }, `${prompt} Fetched technician with ID: ${id}. Technician exists.`);
  } catch (err) {
    logger.error({ id, err }, `${prompt} Error fetching technician for update`);
    return NextResponse.json({ error: "Error fetching technician." }, { status: 500 });
  }

  // 3. Handle image upload/removal
  let technicianImageId = technician?.imageId;
  let newTechnicianImage;
  let uploadedImage;

  if (imageFile) {
    logger.info(`${prompt} Image file provided. Proceeding with image upload...`);
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      logger.info(`${prompt} Invoking uploadToCloudinaryServer function...`);
      uploadedImage = await uploadToCloudinaryServer(buffer);
      logger.info({ id, uploadedImage }, `${prompt} Invocation of uploadToCloudinaryServer function successfully completed. Image uploaded to Cloudinary.`);
    } catch (err) {
      logger.error({ err }, `${prompt} Error uploading image to Cloudinary`);
      return NextResponse.json({ error: "Error uploading image." }, { status: 500 });
    }

    try {
      logger.info(`${prompt} Proceeding to create new UserImage entry in local DB...`);
      logger.info(`${prompt} Invoking prisma.image.create function...`);
      newTechnicianImage = await prisma.image.create({
        data: { url: uploadedImage.url, publicId: uploadedImage.publicId },
      });
      logger.info(`${prompt} Invocation of prisma.image.create function successfully completed.`);
      technicianImageId = newTechnicianImage.id;
      logger.info({ id, newTechnicianImageId: newTechnicianImage.id }, `${prompt} New UserImage entry created in DB`);
    } catch (err) {
      logger.error({ err }, `${prompt} Error creating UserImage entry in DB`);
      cleanupCloudinaryImage(uploadedImage.publicId);
      return NextResponse.json({ error: "Error creating image entry." }, { status: 500 });
    }
  } else {
    const removeImage = formData.get("removeImage") === "true";
    if (removeImage && technician?.image?.publicId) {
      logger.info(`${prompt} Image removal requested. Technician has associated an image with public ID: ${technician.image.publicId}. Proceeding with image removal...`);
      try {
        technicianImageId = null;
        logger.info({ id }, `${prompt} Invoking cleanupOldUserImage function to delegate image cleanup to background...`);
        cleanupOldUserImage(id, technician.image.id, technician.image.publicId);
        logger.info({ id }, `${prompt} Invocation of cleanupOldUserImage function successfully completed. Image cleanup delegated to background.`);
      } catch (err) {
        logger.error({ id, err }, `${prompt} Error removing image`);
        return NextResponse.json({ error: "Error removing image." }, { status: 500 });
      }
    }
  }

  // 4. Update technician fields
  const updateData: {
    technicianId: number;
    technicianName: string;
    enabled: boolean;
    status: TechnicianStatusEnum;
    image?: { connect: { id: string } } | { disconnect: true };
  } = {
    technicianId: Number(formData.get("technicianId")),
    technicianName: formData.get("technicianName") as string,
    enabled: formData.get("enabled") === "true",
    status: statusToEnum(formData.get("status") as string) as TechnicianStatusEnum,
  };


  if (technicianImageId) {
    updateData.image = { connect: { id: technicianImageId } };
  } else if (imageFile === null || technicianImageId === null) {
    updateData.image = { disconnect: true };
  }

  const skillIdsRaw = formData.get("skillIds") as string | null;
  const skillIds = skillIdsRaw ? skillIdsRaw.split(",").filter(Boolean) : [];

  try {
    logger.info({ id, updateData }, `${prompt} Updating technician in DB`);
    await prisma.technician.update({
      where: { id: id },
      data: updateData,
    });
    logger.info({ technicianName: technician?.technicianName }, `${prompt} Technician updated successfully`);

    // Update skills
    await prisma.technicianSkill.deleteMany({ where: { technicianId: id } });
    if (skillIds.length > 0) {
      await prisma.technicianSkill.createMany({
        data: skillIds.map(skillId => ({
          technicianId: id,
          skillId,
        })),
        skipDuplicates: true,
      });
    }

    if (imageFile && technician?.image?.publicId && technician?.image?.id) {
      logger.info({ technicianName: technician?.technicianName }, `${prompt} Delegating old image cleanup to background...`);
      cleanupOldUserImage(id, technician.image.id, technician.image.publicId);
    }

    logger.info(`${prompt} Response returned to frontend`);
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error({ id, err }, `${prompt} Error updating technician`);
    if (uploadedImage?.publicId) {
      await deleteFromCloudinary(uploadedImage.publicId);
      logger.info({ id, publicId: uploadedImage.publicId }, `${prompt} Rolled back new image from Cloudinary`);
      if (newTechnicianImage?.id) {
        await prisma.image.delete({ where: { id: newTechnicianImage.id } });
        logger.info({ id, imageId: newTechnicianImage.id }, `${prompt} Rolled back new UserImage entry`);
      }
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}