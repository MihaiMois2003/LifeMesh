// src/core/use-cases/upload-post-images.use-case.ts
import { UserRepository } from "../interfaces/user-repository.interface";

export interface UploadPostImagesRequest {
  userId: string;
  files: File[];
}

export interface UploadPostImagesResponse {
  imageUrls: string[];
  uploadCount: number;
  message: string;
}

export interface ImageUploadService {
  uploadPostImage(file: File): Promise<string>;
  deleteImage(imageUrl: string): Promise<void>;
}

export class UploadPostImagesUseCase {
  constructor(
    private userRepository: UserRepository,
    private imageUploadService: ImageUploadService
  ) {}

  async execute(
    request: UploadPostImagesRequest
  ): Promise<UploadPostImagesResponse> {
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new Error("User not found");
    }

    this.validateFiles(request.files);

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < request.files.length; i++) {
      try {
        console.log(`📸 Uploading image ${i + 1}/${request.files.length}`);
        const imageUrl = await this.imageUploadService.uploadPostImage(
          request.files[i]
        );
        uploadedUrls.push(imageUrl);
      } catch (error: any) {
        console.error(`❌ Failed to upload image ${i + 1}:`, error.message);
        errors.push(`Image ${i + 1}: ${error.message}`);
      }
    }

    if (uploadedUrls.length === 0) {
      throw new Error(`Failed to upload any images: ${errors.join(", ")}`);
    }

    if (errors.length > 0) {
      console.warn(`⚠️ Some uploads failed:`, errors);
    }

    return {
      imageUrls: uploadedUrls,
      uploadCount: uploadedUrls.length,
      message:
        errors.length > 0
          ? `Uploaded ${uploadedUrls.length}/${request.files.length} images successfully`
          : `All ${uploadedUrls.length} images uploaded successfully`,
    };
  }

  private validateFiles(files: File[]): void {
    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    if (files.length > 5) {
      throw new Error("Maximum 5 images allowed per post");
    }

    files.forEach((file, index) => {
      this.validateSingleFile(file, index + 1);
    });
  }

  private validateSingleFile(file: File, fileNumber: number): void {
    if (!(file instanceof File)) {
      throw new Error(`File ${fileNumber}: Invalid file object`);
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(
        `File ${fileNumber}: File size too large. Maximum 10MB allowed`
      );
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `File ${fileNumber}: Invalid file type. Only JPEG, PNG, and WebP images are allowed`
      );
    }

    if (file.name.length > 255) {
      throw new Error(`File ${fileNumber}: File name too long`);
    }
  }
}
