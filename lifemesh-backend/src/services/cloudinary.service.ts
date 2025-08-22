// src/services/cloudinary.service.ts
import { v2 as cloudinary } from "cloudinary";
import { ImageUploadService } from "../core/use-cases/update-avatar.use-case";

export class CloudinaryService implements ImageUploadService {
  private isConfigured: boolean = false;

  constructor() {
    try {
      this.configureCloudinary();
    } catch (error) {
      console.warn(
        "⚠️ Cloudinary not configured. Image upload will be disabled."
      );
      this.isConfigured = false;
    }
  }

  private configureCloudinary(): void {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isConfigured = true;
      console.log("✅ Cloudinary configured successfully");
    } else {
      console.log(
        "ℹ️ Cloudinary configuration missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env"
      );
      this.isConfigured = false;
    }
  }

  async uploadImage(file: File, folder: string = "avatars"): Promise<string> {
    if (!this.isConfigured) {
      throw new Error(
        "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file."
      );
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await new Promise<any>((resolve, reject) => {
        const uploadOptions =
          folder === "posts"
            ? {
                folder: `lifemesh/${folder}`,
                transformation: [
                  { width: 1200, height: 1200, crop: "limit" },
                  { quality: "auto", format: "auto" },
                ],
                public_id: `post_${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
              }
            : {
                folder: `lifemesh/${folder}`,
                transformation: [
                  { width: 400, height: 400, crop: "fill", gravity: "face" },
                  { quality: "auto", format: "auto" },
                ],
                context: {
                  alt: `${folder} image`,
                  uploaded_at: new Date().toISOString(),
                },
              };

        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(new Error(`Image upload failed: ${error.message}`));
            } else {
              resolve(result);
            }
          })
          .end(buffer);
      });

      return result.secure_url;
    } catch (error: any) {
      console.error("Image upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadPostImage(file: File): Promise<string> {
    return this.uploadImage(file, "posts");
  }

  async deleteImage(imageUrl: string): Promise<void> {
    if (!this.isConfigured) {
      console.warn("Cloudinary not configured. Cannot delete image:", imageUrl);
      return;
    }

    try {
      const publicId = this.extractPublicId(imageUrl);
      if (!publicId) {
        throw new Error("Invalid Cloudinary URL");
      }

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== "ok") {
        console.warn(`Failed to delete image: ${result.result}`);
      }
    } catch (error: any) {
      console.error("Image deletion error:", error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
 * Delete multiple images from Cloudinary
 * Used when deleting posts with multiple images
 */
async deleteImages(imageUrls: string[]): Promise<void> {
  if (!this.isConfigured) {
    console.warn("Cloudinary not configured. Cannot delete images:", imageUrls.length);
    return;
  }

  console.log(`🗑️ Deleting ${imageUrls.length} images from Cloudinary...`);

  // Delete images in parallel for better performance
  const deletionPromises = imageUrls.map(async (imageUrl, index) => {
    try {
      await this.deleteImage(imageUrl);
      console.log(`✅ Deleted image ${index + 1}/${imageUrls.length}`);
    } catch (error) {
      console.warn(`⚠️ Failed to delete image ${index + 1}:`, error);
      // Don't throw - we want to try deleting other images even if one fails
    }
  });

  // Wait for all deletions to complete (or fail)
  await Promise.allSettled(deletionPromises);
  
  console.log(`✅ Finished deleting images from Cloudinary`);
}

  private extractPublicId(cloudinaryUrl: string): string | null {
    try {
      const urlParts = cloudinaryUrl.split("/");
      const uploadIndex = urlParts.indexOf("upload");

      if (uploadIndex === -1) return null;

      const pathAfterUpload = urlParts.slice(uploadIndex + 2).join("/");
      const publicId = pathAfterUpload.replace(/\.[^/.]+$/, "");

      return publicId;
    } catch (error) {
      console.error("Failed to extract public ID:", error);
      return null;
    }
  }

  isReady(): boolean {
    return this.isConfigured;
  }
}
