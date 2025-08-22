// src/app/api/posts/[id]/like/route.ts (CREATE THIS NEW FILE)

import { NextRequest } from "next/server";
import { container } from "../../../../../infrastructure/container";
import { successResponse, errorResponse } from "../../../../../utils/api-response";

/**
 * 👍 POST LIKE API ROUTES
 * 
 * This file handles liking/unliking posts:
 * - POST /api/posts/[id]/like - Like or unlike a post (toggle)
 * - GET /api/posts/[id]/like - Get like status for a post
 * 
 * 🔐 SECURITY RULES:
 * - Authentication required for all operations
 * - Users can only like/unlike (no restrictions on whose posts)
 * - Post must exist to be liked
 * 
 * 🏗️ ARCHITECTURE PATTERN:
 * 1. Extract & validate post ID from URL path
 * 2. Authenticate user from JWT token
 * 3. Validate request data (if needed)
 * 4. Execute business logic via use cases
 * 5. Return structured response
 */

// ==========================================
// 👍 POST /api/posts/[id]/like - TOGGLE LIKE
// ==========================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("👍 POST /api/posts/[id]/like - Toggle like for post:", params.id);

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
    // 3️⃣ EXECUTE TOGGLE LIKE USE CASE
    // ==========================================
    const result = await container.toggleLikeUseCase.execute({
      userId: decoded.userId,
      postId: postId,
    });

    console.log(`✅ Like ${result.action}:`, postId, "by user:", decoded.userId);

    // ==========================================
    // 4️⃣ RETURN SUCCESS RESPONSE
    // ==========================================
    return successResponse(
      {
        action: result.action,
        likeStatus: result.likeStatus,
        postId: postId,
        userId: decoded.userId,
      },
      result.message
    );

  } catch (error: any) {
    console.error("Toggle like error:", error);

    // ==========================================
    // 🚨 ERROR HANDLING
    // ==========================================

    // Business logic errors
    if (error.message?.includes("not found")) {
      return errorResponse(error.message, 404);
    }

    if (error.message?.includes("already liked")) {
      return errorResponse(error.message, 409); // Conflict
    }

    if (error.message?.includes("Invalid") && error.message?.includes("ID")) {
      return errorResponse(error.message, 400);
    }

    // Generic server error
    return errorResponse("Failed to toggle like", 500);
  }
}

// ==========================================
// 📊 GET /api/posts/[id]/like - GET LIKE STATUS
// ==========================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("📊 GET /api/posts/[id]/like - Get like status for post:", params.id);

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
    // 2️⃣ AUTHENTICATE USER (OPTIONAL FOR GET)
    // ==========================================
    let userId: string | undefined;
    
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = container.jwtService.verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
        console.log("✅ User authenticated for like status:", decoded.userId);
      }
    }

    // If no valid auth, we can still show like count (but not personal like status)
    if (!userId) {
      console.log("ℹ️ No authentication - showing public like count only");
      
      // Get post to check if it exists and get like count
      const post = await container.postRepository.findById(postId);
      if (!post) {
        return errorResponse("Post not found", 404);
      }

      return successResponse(
        {
          likeStatus: {
            isLiked: false, // Can't know without user context
            likeCount: post.likeCount,
          },
          postId: postId,
          authenticated: false,
        },
        "Like status retrieved (public view)"
      );
    }

    // ==========================================
    // 3️⃣ EXECUTE GET LIKE STATUS USE CASE
    // ==========================================
    const result = await container.getLikeStatusUseCase.execute({
      userId: userId,
      postId: postId,
    });

    console.log("✅ Like status retrieved for user:", userId);

    // ==========================================
    // 4️⃣ RETURN SUCCESS RESPONSE
    // ==========================================
    return successResponse(
      {
        likeStatus: result.likeStatus,
        postId: postId,
        userId: userId,
        authenticated: true,
      },
      "Like status retrieved successfully"
    );

  } catch (error: any) {
    console.error("Get like status error:", error);

    // ==========================================
    // 🚨 ERROR HANDLING
    // ==========================================

    // Business logic errors
    if (error.message?.includes("not found")) {
      return errorResponse(error.message, 404);
    }

    if (error.message?.includes("Invalid") && error.message?.includes("ID")) {
      return errorResponse(error.message, 400);
    }

    // Generic server error
    return errorResponse("Failed to get like status", 500);
  }
}

// ==========================================
// ❌ DELETE /api/posts/[id]/like - UNLIKE POST
// ==========================================
// Note: We could implement explicit unlike, but the POST toggle is more user-friendly
// Keeping this for completeness in case you want explicit unlike

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("❌ DELETE /api/posts/[id]/like - Unlike post:", params.id);

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
    // 3️⃣ EXECUTE UNLIKE (Direct repository call)
    // ==========================================
    
    // Check if post exists
    const post = await container.postRepository.findById(postId);
    if (!post) {
      return errorResponse("Post not found", 404);
    }

    // Check if user has liked the post
    const existingLike = await container.likeRepository.findByUserAndPost(
      decoded.userId,
      postId
    );

    if (!existingLike) {
      return errorResponse("You haven't liked this post", 400);
    }

    // Remove the like
    await container.likeRepository.delete(decoded.userId, postId);

    // Get updated like status
    const likeStatus = await container.likeRepository.getLikeStatus(
      decoded.userId,
      postId
    );

    console.log("✅ Post unliked:", postId, "by user:", decoded.userId);

    // ==========================================
    // 4️⃣ RETURN SUCCESS RESPONSE
    // ==========================================
    return successResponse(
      {
        action: "unliked",
        likeStatus: likeStatus,
        postId: postId,
        userId: decoded.userId,
      },
      "Post unliked successfully"
    );

  } catch (error: any) {
    console.error("Unlike post error:", error);

    // ==========================================
    // 🚨 ERROR HANDLING
    // ==========================================

    // Business logic errors
    if (error.message?.includes("not found")) {
      return errorResponse(error.message, 404);
    }

    if (error.message?.includes("haven't liked")) {
      return errorResponse(error.message, 400);
    }

    // Generic server error
    return errorResponse("Failed to unlike post", 500);
  }
}