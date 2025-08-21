// src/app/api/posts/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { Category, PostType } from "@prisma/client";
import { container } from "../../../infrastructure/container";
import { successResponse, errorResponse } from "../../../utils/api-response";

/**
 * 📝 POSTS API ROUTES
 *
 * This file handles HTTP requests for post operations:
 * - POST /api/posts - Create a new post
 * - GET /api/posts - Get posts with filtering/pagination
 *
 * Pattern:
 * 1. Validate HTTP request
 * 2. Extract/validate data
 * 3. Call use case
 * 4. Return HTTP response
 */

// ==========================================
// 🔧 VALIDATION SCHEMAS
// ==========================================

/**
 * Schema for creating a new post
 * Uses Zod for runtime validation
 */
const createPostSchema = z.object({
  authorId: z.string().uuid(), // Will be set from JWT token
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),

  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content cannot exceed 5000 characters"),

  category: z
    .nativeEnum(Category)
    .refine((val) => Object.values(Category).includes(val), {
      message: "Invalid category",
    }),

  type: z.nativeEnum(PostType).optional(),

  // Location fields (all optional)
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().max(255).optional(),
  radius: z.number().min(0).max(50000).optional(),

  // Media
  imageUrls: z.array(z.string().url()).optional(),

  // Expiration
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
});

/**
 * Schema for updating a post
 * All fields are optional since you might only want to update some fields
 */
const updatePostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters")
    .optional(),

  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content cannot exceed 5000 characters")
    .optional(),

  category: z.nativeEnum(Category).optional(),
  type: z.nativeEnum(PostType).optional(),

  // Location fields (all optional)
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().max(255).optional(),
  radius: z.number().min(0).max(50000).optional(),

  // Media
  imageUrls: z.array(z.string().url()).optional(),

  // Expiration
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
});

// ==========================================
// ✏️ PUT /api/posts - UPDATE POST
// ==========================================

export async function PUT(request: NextRequest) {
  try {
    // ==========================================
    // 1️⃣ AUTHENTICATION CHECK
    // ==========================================
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("Authentication required", 401);
    }

    // Extract and verify JWT token
    const token = authHeader.substring(7);
    const decoded = container.jwtService.verifyToken(token);
    if (!decoded) {
      return errorResponse("Invalid or expired token", 401);
    }

    // ==========================================
    // 2️⃣ GET POST ID FROM QUERY PARAMETERS
    // ==========================================
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("id");

    if (!postId) {
      return errorResponse("Post ID is required", 400);
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(postId)) {
      return errorResponse("Invalid post ID format", 400);
    }

    // ==========================================
    // 3️⃣ CHECK POST EXISTS AND OWNERSHIP
    // ==========================================
    const existingPost = await container.postRepository.findById(postId);
    if (!existingPost) {
      return errorResponse("Post not found", 404);
    }

    // Check if the authenticated user owns this post
    if (existingPost.authorId !== decoded.userId) {
      return errorResponse("You can only edit your own posts", 403);
    }

    // ==========================================
    // 4️⃣ PARSE AND VALIDATE REQUEST BODY
    // ==========================================
    const body = await request.json();
    const validatedData = updatePostSchema.parse(body);

    // ==========================================
    // 5️⃣ EXECUTE UPDATE USE CASE
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

    // ==========================================
    // 6️⃣ RETURN SUCCESS RESPONSE
    // ==========================================
    return successResponse({ post: updatedPost }, "Post updated successfully");
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
    if (error.message) {
      if (error.message.includes("not found")) {
        return errorResponse(error.message, 404);
      }
      if (error.message.includes("own posts")) {
        return errorResponse(error.message, 403);
      }
    }

    // Generic server error
    return errorResponse("Failed to update post", 500);
  }
}

// ==========================================
// 🗑️ DELETE /api/posts - DELETE POST
// ==========================================

export async function DELETE(request: NextRequest) {
  try {
    // ==========================================
    // 1️⃣ AUTHENTICATION CHECK
    // ==========================================
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("Authentication required", 401);
    }

    // Extract and verify JWT token
    const token = authHeader.substring(7);
    const decoded = container.jwtService.verifyToken(token);
    if (!decoded) {
      return errorResponse("Invalid or expired token", 401);
    }

    // ==========================================
    // 2️⃣ GET POST ID FROM QUERY PARAMETERS
    // ==========================================
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("id");

    if (!postId) {
      return errorResponse("Post ID is required", 400);
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(postId)) {
      return errorResponse("Invalid post ID format", 400);
    }

    // ==========================================
    // 3️⃣ CHECK POST EXISTS AND OWNERSHIP
    // ==========================================
    const existingPost = await container.postRepository.findById(postId);
    if (!existingPost) {
      return errorResponse("Post not found", 404);
    }

    // Check if the authenticated user owns this post
    if (existingPost.authorId !== decoded.userId) {
      return errorResponse("You can only delete your own posts", 403);
    }

    // ==========================================
    // 4️⃣ EXECUTE DELETE
    // ==========================================
    await container.postRepository.delete(postId);

    // ==========================================
    // 5️⃣ RETURN SUCCESS RESPONSE
    // ==========================================
    return successResponse(
      { deletedPostId: postId },
      "Post deleted successfully"
    );
  } catch (error: any) {
    console.error("Delete post error:", error);

    // ==========================================
    // 🚨 ERROR HANDLING
    // ==========================================

    // Business logic errors
    if (error.message) {
      if (error.message.includes("not found")) {
        return errorResponse(error.message, 404);
      }
      if (error.message.includes("own posts")) {
        return errorResponse(error.message, 403);
      }
    }

    // Generic server error
    return errorResponse("Failed to delete post", 500);
  }
}

/**
 * Schema for getting posts (query parameters)
 */
const getPostsSchema = z.object({
  // Pagination
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  pageSize: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional(),

  // Filtering
  category: z.nativeEnum(Category).optional(),
  search: z.string().max(100).optional(),
  authorId: z.string().uuid().optional(),

  // Sorting
  sortBy: z.enum(["newest", "oldest", "mostLiked", "mostViewed"]).optional(),
});

// ==========================================
// 📝 POST /api/posts - CREATE POST
// ==========================================

export async function POST(request: NextRequest) {
  try {
    // ==========================================
    // 1️⃣ AUTHENTICATION CHECK
    // ==========================================
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("Authentication required", 401);
    }

    // Extract and verify JWT token
    const token = authHeader.substring(7);
    const decoded = container.jwtService.verifyToken(token);
    if (!decoded) {
      return errorResponse("Invalid or expired token", 401);
    }

    // ==========================================
    // 2️⃣ PARSE AND VALIDATE REQUEST BODY
    // ==========================================
    const body = await request.json();

    // Add the authenticated user's ID to the request
    const requestData = {
      ...body,
      authorId: decoded.userId, // From JWT token
    };

    // Validate the request data
    const validatedData = createPostSchema.parse(requestData);

    // ==========================================
    // 3️⃣ EXECUTE USE CASE
    // ==========================================
    const result = await container.createPostUseCase.execute({
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
      authorId: validatedData.authorId,
    });

    // ==========================================
    // 4️⃣ RETURN SUCCESS RESPONSE
    // ==========================================
    return successResponse(result, "Post created successfully");
  } catch (error: any) {
    console.error("Create post error:", error);

    // ==========================================
    // 🚨 ERROR HANDLING
    // ==========================================

    // Zod validation errors
    if (error.name === "ZodError") {
      const firstError = error.errors[0];
      return errorResponse(`Validation error: ${firstError.message}`, 400);
    }

    // Business logic errors (from use case)
    if (error.message) {
      // Known business errors
      if (
        error.message.includes("required") ||
        error.message.includes("invalid") ||
        error.message.includes("exceed")
      ) {
        return errorResponse(error.message, 400);
      }

      // Authentication errors
      if (
        error.message.includes("token") ||
        error.message.includes("unauthorized")
      ) {
        return errorResponse(error.message, 401);
      }
    }

    // Generic server error
    return errorResponse("Failed to create post", 500);
  }
}

// ==========================================
// 📄 GET /api/posts - GET POSTS
// ==========================================

export async function GET(request: NextRequest) {
  try {
    // ==========================================
    // 1️⃣ PARSE QUERY PARAMETERS
    // ==========================================
    const { searchParams } = new URL(request.url);

    // Convert URLSearchParams to a plain object
    const queryObject = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validatedQuery = getPostsSchema.parse(queryObject);

    // ==========================================
    // 2️⃣ EXECUTE USE CASE
    // ==========================================
    const result = await container.getPostsUseCase.execute({
      page: validatedQuery.page,
      pageSize: validatedQuery.pageSize,
      category: validatedQuery.category,
      search: validatedQuery.search,
      authorId: validatedQuery.authorId,
      sortBy: validatedQuery.sortBy,
    });

    // ==========================================
    // 3️⃣ RETURN SUCCESS RESPONSE
    // ==========================================
    return successResponse(result, "Posts retrieved successfully");
  } catch (error: any) {
    console.error("Get posts error:", error);

    // ==========================================
    // 🚨 ERROR HANDLING
    // ==========================================

    // Zod validation errors
    if (error.name === "ZodError") {
      const firstError = error.errors[0];
      return errorResponse(
        `Invalid query parameter: ${firstError.message}`,
        400
      );
    }

    // Generic server error
    return errorResponse("Failed to retrieve posts", 500);
  }
}
