import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinaryServer, deleteFromCloudinary } from "@/lib/cloudinary";
import pino from "pino";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const logger = pino({ name: "promo-code-create-route" });

export async function POST(req: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    logger.warn("Unauthorized attempt to create promo code");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
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
  const imageFile = formData.get("image") as File | null;

  let uploadedImage = null;
  let promoCodeImage = null;
  let promoCode = null;

  try {
    promoCode = await prisma.promoCode.create({
      data: {
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
      },
    });
    logger.info({ code }, "Promo code created successfully");
  } catch (err) {
    logger.error(err, "Error creating promo code:");
    return NextResponse.json({ error: "Error creating promo code." }, { status: 500 });
  }

  // Image upload
  if (imageFile) {
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      uploadedImage = await uploadToCloudinaryServer(buffer);
      logger.info({ promoCode: promoCode.code, ...uploadedImage }, "Image uploaded successfully");
    } catch (err) {
      logger.error(err, "Error uploading image to Cloudinary:");
      await prisma.promoCode.delete({ where: { id: promoCode.id } });
      return NextResponse.json({ error: "Error uploading image." }, { status: 500 });
    }

    try {
      promoCodeImage = await prisma.image.create({
        data: {
          url: uploadedImage.url,
          publicId: uploadedImage.publicId,
          promoCode: { connect: { id: promoCode.id } },
        },
      });
      await prisma.promoCode.update({
        where: { id: promoCode.id },
        data: { imageId: promoCodeImage.id },
      });
    } catch (err) {
      if (uploadedImage?.publicId) {
        await deleteFromCloudinary(uploadedImage.publicId);
      }
      if (promoCodeImage?.id) {
        await prisma.image.delete({ where: { id: promoCodeImage.id } });
      }
      await prisma.promoCode.delete({ where: { id: promoCode.id } });
      logger.error(err, "Error creating promoCodeImage or updating promo code:");
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  }

  return NextResponse.json({ promoCode });
}

