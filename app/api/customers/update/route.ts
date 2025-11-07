import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinaryServer } from "@/lib/cloudinary/upload";
import { deleteFromCloudinary } from "@/lib/cloudinary/delete";
import { updateCustomer } from "@/app/dashboard/customers/actions";
import { findEmailAddressById, findEmailAddressByAddress, addEmailAddress } from "@/app/dashboard/emailAddresses/actions";
import { findPhoneNumberById, findPhoneNumberByCountryCodeAndNumber, addPhoneNumber } from "@/app/dashboard/phoneNumbers/actions";
import pino from "pino";
import { cleanupOldUserImage } from "@/lib/services/imageCleanupService";
import { cleanupCloudinaryImage } from "@/lib/services/cloudinaryCleanupService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { CustomerType } from "@/lib/types/customer";

const logger = pino({ name: "customer-update-route" });

export async function POST(req: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    logger.warn("Unauthorized attempt to update customer");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const id = formData.get("id") as string;
  const imageFile = formData.get("image") as File | null;

  // 1. Find customer to update
  let customer;
  try {
    customer = await prisma.customer.findUnique({
      where: { id },
      include: { image: true, emailAddress: true, phoneNumber: true },
    });
    logger.info({ customerName: customer?.name }, "Fetched customer for update");
  } catch (err) {
    logger.error({ id, err }, "Error fetching customer for update");
    return NextResponse.json({ error: "Error fetching customer." }, { status: 500 });
  }

  if (!customer) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }

  // 2. Handle image upload/removal
  let customerImageId = customer?.imageId;
  let newCustomerImage;
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
      newCustomerImage = await prisma.image.create({
        data: { url: uploadedImage.url, publicId: uploadedImage.publicId },
      });
      customerImageId = newCustomerImage.id;
      logger.info({ id, newCustomerImageId: newCustomerImage.id }, "Created new CustomerImage entry in DB");
    } catch (err) {
      logger.error({ err }, "Error creating CustomerImage entry in DB");
      cleanupCloudinaryImage(uploadedImage.publicId);
      return NextResponse.json({ error: "Error creating image entry." }, { status: 500 });
    }
  } else {
    const removeImage = formData.get("removeImage") === "true";
    if (removeImage && customer?.image?.publicId) {
      try {
        customerImageId = null;
        logger.info({ id }, "Delegating image cleanup to background...");
        cleanupOldUserImage(id, customer.image.id, customer.image.publicId);
      } catch (err) {
        logger.error({ id, err }, "Error removing image");
        return NextResponse.json({ error: "Error removing image." }, { status: 500 });
      }
    }
  }

  // 3. Handle email and phone updates
  const emailAddressId = formData.get("emailAddressId") as string | null;
  const emailAddress = formData.get("emailAddress") as string | null;
  const phoneNumberId = formData.get("phoneNumberId") as string | null;
  const phoneCountryCode = formData.get("phoneCountryCode") as string | null;
  const phoneNumber = formData.get("phoneNumber") as string | null;

  // 4. Update customer
  const updateData: {
    name?: string;
    type?: CustomerType;
    emailAddressId?: string | null;
    phoneNumberId?: string | null;
    imageId?: string | null;
  } = {};

  const name = formData.get("name") as string | null;
  const type = formData.get("type") as CustomerType | null;

  if (name !== null) updateData.name = name;
  if (type !== null) updateData.type = type;

  // Resolve email address if provided
  if (emailAddressId !== null || emailAddress !== null) {
    let resolvedEmailAddressId: string | null = null;
    if (emailAddressId) {
      const existing = await findEmailAddressById(emailAddressId);
      if (!existing) {
        return NextResponse.json({ error: `EmailAddress with ID ${emailAddressId} not found` }, { status: 400 });
      }
      resolvedEmailAddressId = existing.id;
    } else if (emailAddress) {
      const emailAddressRecord = await findEmailAddressByAddress(emailAddress);
      if (!emailAddressRecord) {
        const newEmailAddress = await addEmailAddress({ address: emailAddress });
        resolvedEmailAddressId = newEmailAddress.id;
      } else {
        resolvedEmailAddressId = emailAddressRecord.id;
      }
    }
    updateData.emailAddressId = resolvedEmailAddressId;
  }

  // Resolve phone number if provided
  if (phoneNumberId !== null || (phoneCountryCode !== null && phoneNumber !== null)) {
    let resolvedPhoneNumberId: string | null = null;
    if (phoneNumberId) {
      const existing = await findPhoneNumberById(phoneNumberId);
      if (!existing) {
        return NextResponse.json({ error: `PhoneNumber with ID ${phoneNumberId} not found` }, { status: 400 });
      }
      resolvedPhoneNumberId = existing.id;
    } else if (phoneCountryCode && phoneNumber) {
      const phoneNumberRecord = await findPhoneNumberByCountryCodeAndNumber(phoneCountryCode, phoneNumber);
      if (!phoneNumberRecord) {
        const newPhoneNumber = await addPhoneNumber({
          countryCode: phoneCountryCode,
          number: phoneNumber,
        });
        resolvedPhoneNumberId = newPhoneNumber.id;
      } else {
        resolvedPhoneNumberId = phoneNumberRecord.id;
      }
    }
    updateData.phoneNumberId = resolvedPhoneNumberId;
  }

  if (customerImageId !== undefined) {
    updateData.imageId = customerImageId;
  }

  try {
    logger.info({ id, updateData }, "Updating customer in DB");
    await updateCustomer(id, updateData);
    logger.info({ customerName: customer?.name }, "Customer updated successfully");

    // If new image was uploaded and customer had an old image, cleanup old image
    if (imageFile && customer?.image?.publicId && customer?.image?.id) {
      logger.info({ customerName: customer?.name }, "Delegating old image cleanup to background...");
      cleanupOldUserImage(id, customer.image.id, customer.image.publicId);
    }

    logger.info("Response returned to frontend");
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error({ id, err }, "Error updating customer");
    // Cleanup if new image was uploaded but customer update failed
    if (uploadedImage?.publicId) {
      await deleteFromCloudinary(uploadedImage.publicId);
      logger.info({ id, publicId: uploadedImage.publicId }, "Rolled back new image from Cloudinary");
      if (newCustomerImage?.id) {
        await prisma.image.delete({ where: { id: newCustomerImage.id } });
        logger.info({ id, imageId: newCustomerImage.id }, "Rolled back new CustomerImage entry");
      }
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

