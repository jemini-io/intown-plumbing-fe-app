import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinaryServer, deleteFromCloudinary } from "@/lib/cloudinary";
import { addCustomer } from "@/app/dashboard/customers/actions";
import pino from "pino";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { CustomerType } from "@/lib/types/customer";

const logger = pino({ name: "customer-create-route" });

export async function POST(req: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    logger.warn("Unauthorized attempt to create customer");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const customerId = Number(formData.get("customerId"));
  const name = formData.get("name") as string;
  const type = formData.get("type") as CustomerType;
  const emailAddressId = formData.get("emailAddressId") as string | null;
  const emailAddress = formData.get("emailAddress") as string | null;
  const phoneNumberId = formData.get("phoneNumberId") as string | null;
  const phoneCountryCode = formData.get("phoneCountryCode") as string | null;
  const phoneNumber = formData.get("phoneNumber") as string | null;
  const imageFile = formData.get("image") as File | null;

  let uploadedImage = null;
  let customerImage = null;
  let customer = null;

  // 1. Create customer using addCustomer action (handles email/phone logic)
  try {
    customer = await addCustomer({
      customerId,
      name,
      type: type || "RESIDENTIAL",
      emailAddress: emailAddressId
        ? { Id: emailAddressId }
        : emailAddress
        ? { address: emailAddress }
        : undefined,
      phoneNumber: phoneNumberId
        ? { Id: phoneNumberId }
        : phoneCountryCode && phoneNumber
        ? { countryCode: phoneCountryCode, number: phoneNumber }
        : undefined,
    });

    logger.info({ name, customerId }, "Customer created successfully");
  } catch (err) {
    logger.error(err, "Error creating customer:");
    return NextResponse.json({ error: "Error creating customer." }, { status: 500 });
  }

  // 2. Image upload
  if (imageFile) {
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      uploadedImage = await uploadToCloudinaryServer(buffer);
      logger.info({ customer: customer.name, ...uploadedImage }, "Image uploaded successfully");
    } catch (err) {
      logger.error(err, "Error uploading image to Cloudinary:");
      // Rollback: delete customer if image upload fails
      await prisma.customer.delete({ where: { id: customer.id } });
      return NextResponse.json({ error: "Error uploading image." }, { status: 500 });
    }

    try {
      customerImage = await prisma.image.create({
        data: {
          url: uploadedImage.url,
          publicId: uploadedImage.publicId,
          customer: { connect: { id: customer.id } },
        },
      });
      await prisma.customer.update({
        where: { id: customer.id },
        data: { imageId: customerImage.id },
      });
    } catch (err) {
      if (uploadedImage?.publicId) {
        await deleteFromCloudinary(uploadedImage.publicId);
      }
      if (customerImage?.id) {
        await prisma.image.delete({ where: { id: customerImage.id } });
      }
      await prisma.customer.delete({ where: { id: customer.id } });
      logger.error(err, "Error creating customerImage or updating customer:");
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  }

  return NextResponse.json({ customer });
}

