// src/core/use-cases/toggle-like.use-case.ts
import { LikeRepository } from "../interfaces/like-repository.interface";
import { PostRepository } from "../interfaces/post-repository.interface";
import { LikeStatus } from "../entities/like.entity";

/**
 * 👍 TOGGLE LIKE USE CASE
 * 
 * Handles the business logic for liking/unliking posts
 * This is the "smart" operation that decides whether to like or unlike
 */

export interface ToggleLikeRequest {
  userId: string;
  postId: string;
}

export interface ToggleLikeResponse {
  success: boolean;
  action: "liked" | "unliked";
  likeStatus: LikeStatus;
  message: string;
}

export class ToggleLikeUseCase {
  constructor(
    private likeRepository: LikeRepository,
    private postRepository: PostRepository
  ) {}

  async execute(request: ToggleLikeRequest): Promise<ToggleLikeResponse> {
    try {
      // ==========================================
      // 1️⃣ VALIDATE REQUEST
      // ==========================================
      this.validateRequest(request);

      // ==========================================
      // 2️⃣ CHECK IF POST EXISTS
      // ==========================================
      const post = await this.postRepository.findById(request.postId);
      if (!post) {
        throw new Error("Post not found");
      }

      // ==========================================
      // 3️⃣ CHECK CURRENT LIKE STATUS
      // ==========================================
      const existingLike = await this.likeRepository.findByUserAndPost(
        request.userId,
        request.postId
      );

      // ==========================================
      // 4️⃣ TOGGLE LIKE STATUS
      // ==========================================
      let action: "liked" | "unliked";
      
      if (existingLike) {
        // User has already liked - UNLIKE
        await this.likeRepository.delete(request.userId, request.postId);
        action = "unliked";
      } else {
        // User hasn't liked - LIKE
        await this.likeRepository.create({
          userId: request.userId,
          postId: request.postId,
        });
        action = "liked";
      }

      // ==========================================
      // 5️⃣ GET UPDATED STATUS
      // ==========================================
      const likeStatus = await this.likeRepository.getLikeStatus(
        request.userId,
        request.postId
      );

      // ==========================================
      // 6️⃣ RETURN RESULT
      // ==========================================
      return {
        success: true,
        action,
        likeStatus,
        message: action === "liked" ? "Post liked successfully" : "Post unliked successfully",
      };

    } catch (error: any) {
      console.error("Toggle like error:", error);

      // Handle specific business errors
      if (error.message === "Post not found") {
        throw error;
      }

      if (error.message === "You have already liked this post") {
        throw error;
      }

      // Generic error
      throw new Error("Failed to toggle like");
    }
  }

  // ==========================================
  // 🔍 VALIDATION
  // ==========================================
  private validateRequest(request: ToggleLikeRequest): void {
    if (!request.userId || request.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    if (!request.postId || request.postId.trim().length === 0) {
      throw new Error("Post ID is required");
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(request.userId)) {
      throw new Error("Invalid user ID format");
    }

    if (!uuidRegex.test(request.postId)) {
      throw new Error("Invalid post ID format");
    }
  }
}

// ==========================================
// 📊 GET LIKE STATUS USE CASE
// ==========================================

/**
 * 📊 GET LIKE STATUS USE CASE
 * 
 * Gets the like status for a post (without toggling)
 * Useful for displaying current state in UI
 */

export interface GetLikeStatusRequest {
  userId: string;
  postId: string;
}

export interface GetLikeStatusResponse {
  success: boolean;
  likeStatus: LikeStatus;
}

export class GetLikeStatusUseCase {
  constructor(private likeRepository: LikeRepository) {}

  async execute(request: GetLikeStatusRequest): Promise<GetLikeStatusResponse> {
    try {
      // Validate request
      if (!request.userId || !request.postId) {
        throw new Error("User ID and Post ID are required");
      }

      // Get like status
      const likeStatus = await this.likeRepository.getLikeStatus(
        request.userId,
        request.postId
      );

      return {
        success: true,
        likeStatus,
      };

    } catch (error: any) {
      console.error("Get like status error:", error);
      throw new Error("Failed to get like status");
    }
  }
}

// ==========================================
// 📋 GET USER LIKED POSTS USE CASE
// ==========================================

/**
 * 📋 GET USER LIKED POSTS USE CASE
 * 
 * Gets all posts that a user has liked
 * Useful for "My Liked Posts" feature
 */

export interface GetUserLikedPostsRequest {
  userId: string;
  page?: number;
  pageSize?: number;
}

export interface GetUserLikedPostsResponse {
  success: boolean;
  likes: any[]; // Array of likes with post details
  pagination: {
    currentPage: number;
    pageSize: number;
    hasMore: boolean;
  };
}

export class GetUserLikedPostsUseCase {
  constructor(private likeRepository: LikeRepository) {}

  async execute(request: GetUserLikedPostsRequest): Promise<GetUserLikedPostsResponse> {
    try {
      // Set defaults
      const page = request.page || 1;
      const pageSize = Math.min(request.pageSize || 20, 100); // Max 100 per page
      const skip = (page - 1) * pageSize;

      // Get liked posts
      const likes = await this.likeRepository.findByUser(request.userId, {
        skip,
        take: pageSize + 1, // Get one extra to check if there are more
      });

      // Check if there are more posts
      const hasMore = likes.length > pageSize;
      if (hasMore) {
        likes.pop(); // Remove the extra item
      }

      return {
        success: true,
        likes,
        pagination: {
          currentPage: page,
          pageSize,
          hasMore,
        },
      };

    } catch (error: any) {
      console.error("Get user liked posts error:", error);
      throw new Error("Failed to get liked posts");
    }
  }
}