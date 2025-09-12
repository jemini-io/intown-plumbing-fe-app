import { deleteFromCloudinary } from "@/lib/cloudinary/delete";
import pino from "pino";

const logger = pino({ name: "cloudinary-cleanup-service" });

export function cleanupCloudinaryImage(publicId: string) {
  setImmediate(async () => {
    try {
      await deleteFromCloudinary(publicId);
      logger.info({ publicId }, "Removed image from Cloudinary (background)");
    } catch (err) {
      logger.error({ err }, "Error cleaning up image in Cloudinary from background task");
    }
  });
}