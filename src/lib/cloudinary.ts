import { v2 as cloudinary } from "cloudinary";
import { hasCloudinaryServerConfig } from "@/lib/integrations";

let cloudinaryConfigured = false;

export function getCloudinary() {
  if (!hasCloudinaryServerConfig()) {
    throw new Error(
      "Missing Cloudinary credentials. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  if (!cloudinaryConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    cloudinaryConfigured = true;
  }

  return cloudinary;
}

export function createUploadSignature(
  paramsToSign: Record<string, string | number | boolean | undefined>,
) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiSecret) {
    throw new Error("Missing CLOUDINARY_API_SECRET.");
  }

  const cleanedParams = Object.fromEntries(
    Object.entries(paramsToSign)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => [key, String(value)]),
  );

  return getCloudinary().utils.api_sign_request(cleanedParams, apiSecret);
}
