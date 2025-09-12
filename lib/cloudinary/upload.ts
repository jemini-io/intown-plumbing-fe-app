import cloudinary from "cloudinary";
import { Readable } from "stream";
import { cloudinaryConfig } from "./config";

cloudinary.v2.config({
  cloud_name: cloudinaryConfig.cloudName,
  api_key: cloudinaryConfig.apiKey,
  api_secret: cloudinaryConfig.apiSecret,
});

export async function uploadToCloudinaryServer(
  fileBuffer: Buffer
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { folder: "users" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    Readable.from(fileBuffer).pipe(stream);
  });
}
