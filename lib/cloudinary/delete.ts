import cloudinary from "cloudinary";
import pino from "pino";

const logger = pino({ name: "cloudinary-delete" });

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  const prompt = "deleteFromCloudinary function says:";
  logger.info(`${prompt} Starting...`);
  try {
    logger.info(`${prompt} Invoking cloudinary.v2.uploader.destroy function with public ID: ${publicId}...`);
    const result = await cloudinary.v2.uploader.destroy(publicId);
    logger.info(`${prompt} Invocation of cloudinary.v2.uploader.destroy function successfully completed.`);
    logger.info(`${prompt} Returning result: ${result.result} to the caller.`);
    return result.result === "ok";
  } catch (err) {
    logger.error({ err }, `${prompt} Error invoking cloudinary.v2.uploader.destroy function:`);
    logger.info(`${prompt} Returning 'false' to the caller.`);
    return false;
  }
}