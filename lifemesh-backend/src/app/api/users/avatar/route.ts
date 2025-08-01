// src/app/api/user/avatar/route.ts
import { NextRequest } from "next/server";
import { container } from "../../../../infrastructure/container";
import { successResponse, errorResponse } from "../../../../utils/api-response";

export async function POST(request: NextRequest) {
  try {
    // 1. 🔐 Get JWT token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("No valid token provided", 401);
    }

    // 2. 🎫 Extract and verify token
    const token = authHeader.substring(7);
    const decoded = container.jwtService.verifyToken(token);
    if (!decoded) {
      return errorResponse("Invalid or expired token", 401);
    }

    // 3. 📁 Parse form data
    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return errorResponse("No avatar file provided", 400);
    }

    // 4. ✅ Basic file validation
    if (!(file instanceof File)) {
      return errorResponse("Invalid file format", 400);
    }

    // 5. 💼 Execute use case
    const result = await container.updateAvatarUseCase.execute({
      userId: decoded.userId,
      file: file,
    });

    // 6. ✅ Return success response
    return successResponse(result, "Avatar updated successfully");
  } catch (error: any) {
    console.error("Avatar upload error:", error);

    // 🔍 Handle specific error types
    if (error.message.includes("File size")) {
      return errorResponse(error.message, 413); // Payload Too Large
    }

    if (
      error.message.includes("file type") ||
      error.message.includes("images are allowed")
    ) {
      return errorResponse(error.message, 415); // Unsupported Media Type
    }

    if (error.message.includes("User not found")) {
      return errorResponse(error.message, 404);
    }

    // 🚨 Generic server error
    return errorResponse(error.message || "Avatar upload failed", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 1. 🔐 Authentication (same as POST)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("No valid token provided", 401);
    }

    const token = authHeader.substring(7);
    const decoded = container.jwtService.verifyToken(token);
    if (!decoded) {
      return errorResponse("Invalid or expired token", 401);
    }

    // 2. 🔍 Get current user to find avatar URL
    const user = await container.userRepository.findById(decoded.userId);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (!user.avatar) {
      return errorResponse("No avatar to delete", 400);
    }

    // 3. 🗑️ Delete from cloud storage
    await container.imageUploadService.deleteImage(user.avatar);

    // 4. 🔄 Remove avatar URL from database
    const updatedUser = await container.userRepository.updateAvatar(
      decoded.userId,
      "" // Empty string or null to remove avatar
    );

    // 5. 🔒 Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    return successResponse(
      { user: userWithoutPassword },
      "Avatar deleted successfully"
    );
  } catch (error: any) {
    console.error("Avatar deletion error:", error);
    return errorResponse(error.message || "Avatar deletion failed", 500);
  }
}
