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
  let technician;
  try {
    technician = await prisma.technician.findUnique({
      where: { id },
      include: { image: true },
    });
    logger.info({ technicianName: technician?.technicianName }, "Fetched technician for update");
  } catch (err) {
    logger.error({ id, err }, "Error fetching technician for update");
    return NextResponse.json({ error: "Error fetching technician." }, { status: 500 });
  }

  // 3. Handle image upload/removal
  let technicianImageId = technician?.imageId;
  let newTechnicianImage;
  let uploadedImage;

  if (imageFile) {
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      uploadedImage = await uploadToCloudinaryServer(buffer);
      logger.info({ id, uploadedImage }, "Image uploaded to Cloudinary");
    } catch (err) {
      logger.error({ err }, "Error uploading image to Cloudinary");
      return NextResponse.json({ error: "Error uploading image." }, { status: 500 });
    }

    try {
      newTechnicianImage = await prisma.userImage.create({
        data: { url: uploadedImage.url, publicId: uploadedImage.publicId },
      });
      technicianImageId = newTechnicianImage.id;
      logger.info({ id, newTechnicianImageId: newTechnicianImage.id }, "Created new UserImage entry in DB");
    } catch (err) {
      logger.error({ err }, "Error creating UserImage entry in DB");
      cleanupCloudinaryImage(uploadedImage.publicId);
      return NextResponse.json({ error: "Error creating image entry." }, { status: 500 });
    }
  } else {
    const removeImage = formData.get("removeImage") === "true";
    if (removeImage && technician?.image?.publicId) {
      try {
        technicianImageId = null;
        logger.info({ id }, "Delegating image cleanup to background...");
        cleanupOldUserImage(id, technician.image.id, technician.image.publicId);
      } catch (err) {
        logger.error({ id, err }, "Error removing image");
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
    logger.info({ id, updateData }, "Updating technician in DB");
    await prisma.technician.update({
      where: { id: id },
      data: updateData,
    });
    logger.info({ technicianName: technician?.technicianName }, "Technician updated successfully");

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
      logger.info({ technicianName: technician?.technicianName }, "Delegating old image cleanup to background...");
      cleanupOldUserImage(id, technician.image.id, technician.image.publicId);
    }

    logger.info("Response returned to frontend");
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error({ id, err }, "Error updating technician");
    if (uploadedImage?.publicId) {
      await deleteFromCloudinary(uploadedImage.publicId);
      logger.info({ id, publicId: uploadedImage.publicId }, "Rolled back new image from Cloudinary");
      if (newTechnicianImage?.id) {
        await prisma.userImage.delete({ where: { id: newTechnicianImage.id } });
        logger.info({ id, imageId: newTechnicianImage.id }, "Rolled back new UserImage entry");
      }
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}