import cloudinary from "../config/cloudinary.js";
import { ApiError } from "./ApiError.js";

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} - Cloudinary URL
 */
export const uploadToCloudinary = async (fileBuffer, folder = "studysync") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
        transformation: [
          { width: 500, height: 500, crop: "limit" }, // Max dimensions
          { quality: "auto" }, // Auto quality optimization
          { fetch_format: "auto" }, // Auto format (WebP if supported)
        ],
      },
      (error, result) => {
        if (error) {
          reject(new ApiError(500, "Failed to upload image to Cloudinary"));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} imageUrl - Full Cloudinary URL
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234/studysync/avatar.jpg
    // public_id = studysync/avatar
    const urlParts = imageUrl.split("/");
    const publicIdWithExtension = urlParts.slice(-2).join("/"); // studysync/avatar.jpg
    const publicId = publicIdWithExtension.split(".")[0]; // studysync/avatar

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    // Don't throw — deletion failure shouldn't block the request
  }
};