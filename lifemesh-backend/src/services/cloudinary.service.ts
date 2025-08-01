// src/services/cloudinary.service.ts (Updated - Optional Configuration)
import { v2 as cloudinary } from "cloudinary";
import { ImageUploadService } from "../core/use-cases/update-avatar.use-case";

export class CloudinaryService implements ImageUploadService {
  private isConfigured: boolean = false;

  constructor() {
    try {
      // 🔄 Try to configure Cloudinary, but don't fail if missing
      this.configureCloudinary();
    } catch (error) {
      console.warn(
        "⚠️ Cloudinary not configured. Avatar upload will be disabled."
      );
      this.isConfigured = false;
    }
  }

  private configureCloudinary(): void {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // ✅ Only configure if all values exist
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
        "ℹ️ Cloudinary configuration missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env to enable avatar uploads."
      );
      this.isConfigured = false;
    }
  }

  async uploadImage(file: File, folder: string): Promise<string> {
    // 🚫 Check if Cloudinary is configured
    if (!this.isConfigured) {
      throw new Error(
        "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file."
      );
    }

    try {
      // 📁 Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // ☁️ Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `lifemesh/${folder}`,
              transformation: [
                {
                  width: 400,
                  height: 400,
                  crop: "fill",
                  gravity: "face",
                },
                {
                  quality: "auto",
                  format: "auto",
                },
              ],
              context: {
                alt: `${folder} image`,
                uploaded_at: new Date().toISOString(),
              },
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(new Error(`Image upload failed: ${error.message}`));
              } else {
                resolve(result);
              }
            }
          )
          .end(buffer);
      });

      return result.secure_url;
    } catch (error: any) {
      console.error("Image upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    // 🚫 Check if Cloudinary is configured
    if (!this.isConfigured) {
      console.warn("Cloudinary not configured. Cannot delete image:", imageUrl);
      return; // Silently skip deletion if not configured
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

  // 🆕 NEW: Method to check if service is ready
  isReady(): boolean {
    return this.isConfigured;
  }
}
