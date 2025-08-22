// src/app/api/posts/upload-images/route.ts
import { NextRequest } from "next/server";
import { container } from "../../../../infrastructure/container";
import { successResponse, errorResponse } from "../../../../utils/api-response";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("Authentication required", 401);
    }

    const token = authHeader.substring(7);
    const decoded = container.jwtService.verifyToken(token);
    if (!decoded) {
      return errorResponse("Invalid or expired token", 401);
    }

    const formData = await request.formData();
    const files: File[] = [];

    const imageFiles = formData.getAll("images");
    for (const file of imageFiles) {
      if (file instanceof File) {
        files.push(file);
      }
    }

    const singleFile = formData.get("image") as File;
    if (singleFile instanceof File) {
      files.push(singleFile);
    }

    let index = 0;
    while (true) {
      const numberedFile = formData.get(`image${index}`) as File;
      if (!numberedFile) break;
      if (numberedFile instanceof File) {
        files.push(numberedFile);
      }
      index++;
    }

    if (files.length === 0) {
      return errorResponse("No image files provided", 400);
    }

    console.log(`📸 Received ${files.length} files for upload`);

    const result = await container.uploadPostImagesUseCase.execute({
      userId: decoded.userId,
      files: files,
    });

    return successResponse(result, result.message);
  } catch (error: any) {
    console.error("Post images upload error:", error);

    if (error.message.includes("File size too large")) {
      return errorResponse(error.message, 413);
    }

    if (
      error.message.includes("Invalid file type") ||
      error.message.includes("Only") ||
      error.message.includes("images are allowed")
    ) {
      return errorResponse(error.message, 415);
    }

    if (
      error.message.includes("Maximum") ||
      error.message.includes("No files")
    ) {
      return errorResponse(error.message, 400);
    }

    if (error.message.includes("User not found")) {
      return errorResponse(error.message, 404);
    }

    return errorResponse(error.message || "Image upload failed", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("Authentication required", 401);
    }

    const token = authHeader.substring(7);
    const decoded = container.jwtService.verifyToken(token);
    if (!decoded) {
      return errorResponse("Invalid or expired token", 401);
    }

    const body = await request.json();
    const { imageUrls } = body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return errorResponse("No image URLs provided", 400);
    }

    console.log(`🗑️ Deleting ${imageUrls.length} images`);

    const deletionResults = await Promise.allSettled(
      imageUrls.map((url) => container.imageUploadService.deleteImage(url))
    );

    const successCount = deletionResults.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failureCount = deletionResults.length - successCount;

    return successResponse(
      {
        deletedCount: successCount,
        failedCount: failureCount,
        totalRequested: imageUrls.length,
      },
      `Successfully deleted ${successCount}/${imageUrls.length} images`
    );
  } catch (error: any) {
    console.error("Image deletion error:", error);
    return errorResponse("Failed to delete images", 500);
  }
}
