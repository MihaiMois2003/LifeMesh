// src/app/api/posts/[id]/route.ts (CREATE THIS NEW FILE)

import { NextRequest } from "next/server";
import { z } from "zod";
import { Category, PostType, UserRole } from "@prisma/client";
import { container } from "../../../../infrastructure/container";
import { successResponse, errorResponse } from "../../../../utils/api-response";

/**
 * 🎯 INDIVIDUAL POST OPERATIONS
 * 
 * This file handles operations on specific posts:
 * - PUT /api/posts/[id] - Update a specific post
 * - DELETE /api/posts/[id] - Delete a specific post
 * - GET /api/posts/[id] - Get a specific post (future)
 * 
 * 🔐 SECURITY RULES:
 * - Only post author can modify their posts
 * - Admins can modify/delete any post
 * - Authentication required for all operations
 * 
 * 🏗️ ARCHITECTURE PATTERN:
 * 1. Extract & validate post ID from URL path
 * 2. Authenticate user from JWT token
 * 3. Check authorization (ownership or admin)
 * 4. Validate request data
 * 5. Execute business logic via use cases
 * 6. Return structured response
 */

// ==========================================
// 🔧 VALIDATION SCHEMAS
// ==========================================

/**
 * Schema for updating a post
 * All fields are optional since partial updates are allowed
 */
const updatePostSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(200, "Title cannot exceed 200 characters")
    .optional(),

  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(5000, "Content cannot exceed 5000 characters")
    .optional(),

  category: z.nativeEnum(Category).optional(),
  type: z.nativeEnum(PostType).optional(),

  // Location fields (all optional, can be set to null to clear)
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  address: z.string().max(255).nullable().optional(),
  radius: z.number().min(0).max(50000).nullable().optional(),

  // Media updates
  imageUrls: z.array(z.string().url()).nullable().optional(),

  // Expiration updates
  expiresAt: z
    .string()
    .datetime()
    .nullable()
    .optional()
    .transform((str) => (str ? new Date(str) : null)),
});

// ==========================================
// 🔐 AUTHORIZATION HELPER
// ==========================================

/**
 * Checks if user can modify the post
 * Rules: Post author OR admin can modify
 */
async function canModifyPost(
  postId: string, 
  userId: string
): Promise<{ canModify: boolean; post: any; reason?: string }> {
  try {
    // 1. Get the post
    const post = await container.postRepository.findById(postId);
    if (!post) {
      return { canModify: false, post: null, reason: "Post not found" };
    }

    // 2. Get the user to check their role
    const user = await container.userRepository.findById(userId);
    if (!user) {
      return { canModify: false, post, reason: "User not found" };
    }

    // 3. Check authorization rules
    const isOwner = post.authorId === userId;
    const isAdmin = user.role === UserRole.ADMIN;

    if (isOwner || isAdmin) {
      return { canModify: true, post };
    }

    return { 
      canModify: false, 
      post, 
      reason: isAdmin ? "Admin access" : "Only post author can modify this post"
    };
  } catch (error) {
    console.error("Authorization check failed:", error);
    return { canModify: false, post: null, reason: "Authorization check failed" };
  }
}

// ==========================================
// 📝 GET /api/posts/[id] - GET SPECIFIC POST
// ==========================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 GET /api/posts/[id] - Fetching specific post:", params.id);

    // ==========================================
    // 1️⃣ VALIDATE POST ID
    // ==========================================
    const postId = params.id;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(postId)) {
      return errorResponse("Invalid post ID format", 400);
    }

    // ==========================================
    // 2️⃣ GET POST
    // ==========================================
    const post = await container.postRepository.findById(postId);
    if (!post) {
      return errorResponse("Post not found", 404);
    }

    // ==========================================
    // 3️⃣ INCREMENT VIEW COUNT (NON-BLOCKING)
    // ==========================================
    // Don't await this - let it run in background
    container.postRepository.incrementViewCount(postId).catch(() => {
      // Silently ignore view count errors
    });

    // ==========================================
    // 4️⃣ RETURN SUCCESS RESPONSE
    // ==========================================
    return successResponse({ post }, "Post retrieved successfully");

  } catch (error: any) {
    console.error("Get post by ID error:", error);
    return errorResponse("Failed to retrieve post", 500);
  }
}

// ==========================================
// ✏️ PUT /api/posts/[id] - UPDATE POST
// ==========================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("✏️ PUT /api/posts/[id] - Updating post:", params.id);

    // ==========================================
    // 1️⃣ VALIDATE POST ID
    // ==========================================
    const postId = params.id;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(postId)) {
      return errorResponse("Invalid post ID format", 400);
    }

    // ==========================================
    // 2️⃣ AUTHENTICATE USER
    // ==========================================
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("Authentication required", 401);
    }

    const token = authHeader.substring(7);
    const decoded = container.jwtService.verifyToken(token);
    if (!decoded) {
      return errorResponse("Invalid or expired token", 401);
    }

    console.log("✅ User authenticated:", decoded.userId);

    // ==========================================
    // 3️⃣ CHECK AUTHORIZATION
    // ==========================================
    const authCheck = await canModifyPost(postId, decoded.userId);
    if (!authCheck.canModify) {
      return errorResponse(authCheck.reason || "Access denied", 403);
    }

    console.log("✅ User authorized to modify post");

    // ==========================================
    // 4️⃣ VALIDATE REQUEST BODY
    // ==========================================
    const body = await request.json();
    
    // Check if update data is provided
    if (Object.keys(body).length === 0) {
      return errorResponse("No update data provided", 400);
    }

    const validatedData = updatePostSchema.parse(body);
    console.log("✅ Update data validated");

    // ==========================================
    // 5️⃣ EXECUTE UPDATE
    // ==========================================
    const updatedPost = await container.postRepository.update(postId, {
      title: validatedData.title,
      content: validatedData.content,
      category: validatedData.category,
      type: validatedData.type,
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
      address: validatedData.address,
      radius: validatedData.radius,
      imageUrls: validatedData.imageUrls,
      expiresAt: validatedData.expiresAt,
    });

    console.log("✅ Post updated successfully:", updatedPost.id);

    // ==========================================
    // 6️⃣ RETURN SUCCESS RESPONSE
    // ==========================================
    return successResponse(
      { post: updatedPost }, 
      "Post updated successfully"
    );

  } catch (error: any) {
    console.error("Update post error:", error);

    // ==========================================
    // 🚨 ERROR HANDLING
    // ==========================================

    // Zod validation errors
    if (error.name === "ZodError") {
      const firstError = error.errors[0];
      return errorResponse(`Validation error: ${firstError.message}`, 400);
    }

    // Business logic errors
    if (error.message?.includes("not found")) {
      return errorResponse(error.message, 404);
    }

    // Generic server error
    return errorResponse("Failed to update post", 500);
  }
}

// ==========================================
// 🗑️ DELETE /api/posts/[id] - DELETE POST
// ==========================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🗑️ DELETE /api/posts/[id] - Deleting post:", params.id);

    // ==========================================
    // 1️⃣ VALIDATE POST ID
    // ==========================================
    const postId = params.id;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(postId)) {
      return errorResponse("Invalid post ID format", 400);
    }

    // ==========================================
    // 2️⃣ AUTHENTICATE USER
    // ==========================================
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("Authentication required", 401);
    }

    const token = authHeader.substring(7);
    const decoded = container.jwtService.verifyToken(token);
    if (!decoded) {
      return errorResponse("Invalid or expired token", 401);
    }

    console.log("✅ User authenticated:", decoded.userId);

    // ==========================================
    // 3️⃣ CHECK AUTHORIZATION
    // ==========================================
    const authCheck = await canModifyPost(postId, decoded.userId);
    if (!authCheck.canModify) {
      return errorResponse(authCheck.reason || "Access denied", 403);
    }

    console.log("✅ User authorized to delete post");

    // ==========================================
    // 4️⃣ OPTIONAL: DELETE ASSOCIATED IMAGES
    // ==========================================
    // If post has images, we could delete them from Cloudinary
    // This is optional - you might want to keep images for audit trails
    const post = authCheck.post;
    if (post.imageUrls && Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
      console.log(`🗑️ Post has ${post.imageUrls.length} images to clean up`);
      
      // Delete images in background (non-blocking)
      container.imageUploadService.deleteImages?.(post.imageUrls).catch((error) => {
        console.warn("Failed to delete some post images:", error);
        // Don't fail the post deletion if image cleanup fails
      });
    }

    // ==========================================
    // 5️⃣ EXECUTE DELETE
    // ==========================================
    await container.postRepository.delete(postId);
    console.log("✅ Post deleted successfully:", postId);

    // ==========================================
    // 6️⃣ RETURN SUCCESS RESPONSE
    // ==========================================
    return successResponse(
      { 
        deletedPostId: postId,
        message: "Post and associated data deleted successfully"
      }, 
      "Post deleted successfully"
    );

  } catch (error: any) {
    console.error("Delete post error:", error);

    // ==========================================
    // 🚨 ERROR HANDLING
    // ==========================================

    // Business logic errors
    if (error.message?.includes("not found")) {
      return errorResponse(error.message, 404);
    }

    // Generic server error
    return errorResponse("Failed to delete post", 500);
  }
}