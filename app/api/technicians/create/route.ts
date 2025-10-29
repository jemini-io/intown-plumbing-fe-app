import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinaryServer, deleteFromCloudinary } from "@/lib/cloudinary";
import pino from "pino";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { statusToEnum } from "@/lib/types/technicianToSkills";

const logger = pino({ name: "technician-create-route" });

export async function POST(req: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    logger.warn("Unauthorized attempt to create technician");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const technicianId = Number(formData.get("technicianId"));
  const technicianName = formData.get("technicianName") as string;
  const enabled = formData.get("enabled") === "true";
  const statusRaw = formData.get("status") as string;
  const status = statusToEnum(statusRaw) as import("@/lib/generated/prisma").TechnicianStatus;
  const skillIdsRaw = formData.get("skillIds") as string | null;
  const skillIds = skillIdsRaw ? skillIdsRaw.split(",").filter(Boolean) : [];
  const imageFile = formData.get("image") as File | null;

  let uploadedImage = null;
  let technicianImage = null;
  let technician = null;

  try {
    technician = await prisma.technician.create({
      data: {
        technicianId,
        technicianName,
        enabled,
        status,
      },
    });
    logger.info({ technicianName, technicianId, status }, "Technician created successfully");
  } catch (err) {
    logger.error(err, "Error creating technician:");
    return NextResponse.json({ error: "Error creating technician." }, { status: 500 });
  }

  // Skills association
  if (skillIds.length > 0) {
    await prisma.technicianSkill.createMany({
      data: skillIds.map(skillId => ({
        technicianId: technician.id,
        skillId,
      })),
      skipDuplicates: true,
    });
  }

  // Image upload
  if (imageFile) {
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      uploadedImage = await uploadToCloudinaryServer(buffer);
      logger.info({ technician: technician.technicianName, ...uploadedImage }, "Image uploaded successfully");
    } catch (err) {
      logger.error(err, "Error uploading image to Cloudinary:");
      await prisma.technician.delete({ where: { id: technician.id } });
      return NextResponse.json({ error: "Error uploading image." }, { status: 500 });
    }

    try {
      technicianImage = await prisma.userImage.create({
        data: {
          url: uploadedImage.url,
          publicId: uploadedImage.publicId,
          technician: { connect: { id: technician.id } },
        },
      });
      await prisma.technician.update({
        where: { id: technician.id },
        data: { imageId: technicianImage.id },
      });
    } catch (err) {
      if (uploadedImage?.publicId) {
        await deleteFromCloudinary(uploadedImage.publicId);
      }
      if (technicianImage?.id) {
        await prisma.userImage.delete({ where: { id: technicianImage.id } });
      }
      await prisma.technician.delete({ where: { id: technician.id } });
      logger.error(err, "Error creating technicianImage or updating technician:");
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  }

  return NextResponse.json({ technician });
}