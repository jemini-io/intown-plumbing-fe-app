import { deleteFromCloudinary } from "@/lib/cloudinary/delete";
import { prisma } from "@/lib/prisma";
import pino from "pino";

const logger = pino({ name: "image-cleanup-service" });

export function cleanupOldUserImage(userId: string, imageId: string, publicId: string) {
  setImmediate(async () => {
    try {
      await deleteFromCloudinary(publicId);
      logger.info({ userId, publicId }, "Removed image from Cloudinary (background)");
      await prisma.userImage.delete({ where: { id: imageId } });
      logger.info({ userId, imageId }, "Removed UserImage entry (background)");
    } catch (err) {
      logger.error({ userId, imageId, err }, "Error cleaning up old image in background");
    }
  });
}