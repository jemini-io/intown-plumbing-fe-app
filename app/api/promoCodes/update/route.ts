import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinaryServer } from "@/lib/cloudinary/upload";
import { deleteFromCloudinary } from "@/lib/cloudinary/delete";
import pino from "pino";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const logger = pino({ name: "promo-code-update-route" });

// Helper to cleanup old image in background
async function cleanupOldPromoCodeImage(promoCodeId: string, imageId: string, publicId: string) {
  try {
    logger.info({ promoCodeId, imageId, publicId }, "Cleaning up old promo code image...");
    await deleteFromCloudinary(publicId);
    await prisma.image.delete({ where: { id: imageId } });
    logger.info({ promoCodeId, imageId }, "Old promo code image cleaned up successfully");
  } catch (err) {
    logger.error({ promoCodeId, imageId, err }, "Error cleaning up old promo code image");
  }
}

export async function POST(req: NextRequest) {
  const prompt = "promo-code-update-route function says:";
  logger.info(`${prompt} Starting...`);
  
  // 1. Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    logger.warn("Unauthorized attempt to update promo code");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const id = formData.get("id") as string;
  const imageFile = formData.get("image") as File | null;

  // 2. Fetch existing promo code
  logger.info(`${prompt} Checking if promo code with ID: ${id} exists for update...`);
  let promoCode;
  try {
    promoCode = await prisma.promoCode.findUnique({
      where: { id },
      include: { image: true },
    });
    logger.info({ code: promoCode?.code }, `${prompt} Fetched promo code with ID: ${id}.`);
  } catch (err) {
    logger.error({ id, err }, `${prompt} Error fetching promo code for update`);
    return NextResponse.json({ error: "Error fetching promo code." }, { status: 500 });
  }

  if (!promoCode) {
    return NextResponse.json({ error: "Promo code not found." }, { status: 404 });
  }

  // 3. Handle image upload/removal
  let promoCodeImageId = promoCode.imageId;
  let newPromoCodeImage;
  let uploadedImage;

  if (imageFile) {
    logger.info(`${prompt} Image file provided. Proceeding with image upload...`);
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      uploadedImage = await uploadToCloudinaryServer(buffer);
      logger.info({ id, uploadedImage }, `${prompt} Image uploaded to Cloudinary.`);
    } catch (err) {
      logger.error({ err }, `${prompt} Error uploading image to Cloudinary`);
      return NextResponse.json({ error: "Error uploading image." }, { status: 500 });
    }

    try {
      newPromoCodeImage = await prisma.image.create({
        data: { url: uploadedImage.url, publicId: uploadedImage.publicId },
      });
      promoCodeImageId = newPromoCodeImage.id;
      logger.info({ id, newImageId: newPromoCodeImage.id }, `${prompt} New Image entry created in DB`);
    } catch (err) {
      logger.error({ err }, `${prompt} Error creating Image entry in DB`);
      await deleteFromCloudinary(uploadedImage.publicId);
      return NextResponse.json({ error: "Error creating image entry." }, { status: 500 });
    }
  } else {
    const removeImage = formData.get("removeImage") === "true";
    if (removeImage && promoCode.image?.publicId) {
      logger.info(`${prompt} Image removal requested. Proceeding with image removal...`);
      try {
        promoCodeImageId = null;
        // Cleanup in background
        cleanupOldPromoCodeImage(id, promoCode.image.id, promoCode.image.publicId);
      } catch (err) {
        logger.error({ id, err }, `${prompt} Error removing image`);
        return NextResponse.json({ error: "Error removing image." }, { status: 500 });
      }
    }
  }

  // 4. Update promo code fields
  const code = (formData.get("code") as string).trim().toUpperCase();
  const type = formData.get("type") as "PERCENT" | "AMOUNT";
  const value = parseFloat(formData.get("value") as string);
  const description = formData.get("description") as string | null;
  const usageLimit = formData.get("usageLimit") ? parseInt(formData.get("usageLimit") as string) : null;
  const minPurchase = formData.get("minPurchase") ? parseFloat(formData.get("minPurchase") as string) : null;
  const maxDiscount = formData.get("maxDiscount") ? parseFloat(formData.get("maxDiscount") as string) : null;
  const startsAt = formData.get("startsAt") ? new Date(formData.get("startsAt") as string) : null;
  const expiresAt = formData.get("expiresAt") ? new Date(formData.get("expiresAt") as string) : null;
  const enabled = formData.get("enabled") === "true";

  try {
    logger.info({ id }, `${prompt} Updating promo code in DB`);
    
    const updateData: Record<string, unknown> = {
      code,
      type,
      value,
      description: description || null,
      usageLimit,
      minPurchase,
      maxDiscount,
      startsAt,
      expiresAt,
      enabled,
    };

    if (promoCodeImageId) {
      updateData.image = { connect: { id: promoCodeImageId } };
    } else if (imageFile === null && promoCodeImageId === null) {
      updateData.image = { disconnect: true };
    }

    await prisma.promoCode.update({
      where: { id },
      data: updateData,
    });
    logger.info({ code: promoCode.code }, `${prompt} Promo code updated successfully`);

    // Cleanup old image if new one was uploaded
    if (imageFile && promoCode.image?.publicId && promoCode.image?.id) {
      logger.info(`${prompt} Delegating old image cleanup to background...`);
      cleanupOldPromoCodeImage(id, promoCode.image.id, promoCode.image.publicId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error({ id, err }, `${prompt} Error updating promo code`);
    if (uploadedImage?.publicId) {
      await deleteFromCloudinary(uploadedImage.publicId);
      if (newPromoCodeImage?.id) {
        await prisma.image.delete({ where: { id: newPromoCodeImage.id } });
      }
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

