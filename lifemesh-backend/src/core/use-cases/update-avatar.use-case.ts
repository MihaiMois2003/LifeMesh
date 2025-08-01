// core/use-cases/update-avatar.use-case.ts
import { UserRepository } from "../interfaces/user-repository.interface";
import { User } from "../entities/user.entity";

export interface UpdateAvatarRequest {
  userId: string;
  file: File;
}

export interface UpdateAvatarResponse {
  user: Omit<User, "password">;
  avatarUrl: string;
}

export interface ImageUploadService {
  uploadImage(file: File, folder: string): Promise<string>;
  deleteImage(imageUrl: string): Promise<void>;
}

export class UpdateAvatarUseCase {
  constructor(
    private userRepository: UserRepository,
    private imageUploadService: ImageUploadService
  ) {}

  async execute(request: UpdateAvatarRequest): Promise<UpdateAvatarResponse> {
    // 1. 🔍 Verify user exists
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // 2. ✅ Validate file
    this.validateImageFile(request.file);

    // 3. 🗑️ Delete old avatar if exists
    if (user.avatar) {
      try {
        await this.imageUploadService.deleteImage(user.avatar);
      } catch (error) {
        console.warn("Failed to delete old avatar:", error);
        // Don't fail the whole operation if old image deletion fails
      }
    }

    // 4. ☁️ Upload new avatar to cloud storage
    const avatarUrl = await this.imageUploadService.uploadImage(
      request.file,
      "avatars"
    );

    // 5. 💾 Update user in database
    const updatedUser = await this.userRepository.updateAvatar(
      request.userId,
      avatarUrl
    );

    // 6. 🔒 Return user without password
    const { password, ...userWithoutPassword } = updatedUser;

    return {
      user: userWithoutPassword,
      avatarUrl,
    };
  }

  private validateImageFile(file: File): void {
    // 📏 Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error("File size must be less than 5MB");
    }

    // 🖼️ Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPEG, PNG, and WebP images are allowed");
    }

    // 📝 Check file name length
    if (file.name.length > 100) {
      throw new Error("File name is too long");
    }
  }
}
