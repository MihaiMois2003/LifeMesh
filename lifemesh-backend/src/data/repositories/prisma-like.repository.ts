// src/data/repositories/prisma-like.repository.ts
import { PrismaClient } from "@prisma/client";
import { LikeRepository } from "../../core/interfaces/like-repository.interface";
import { Like, CreateLikeData, LikeStatus } from "../../core/entities/like.entity";

/**
 * 👍 PRISMA LIKE REPOSITORY
 * 
 * Handles all database operations for likes using Prisma
 * Implements clean separation between business logic and data access
 */
export class PrismaLikeRepository implements LikeRepository {
  constructor(private prisma: PrismaClient) {}

  // ==========================================
  // 👍 CORE LIKE OPERATIONS
  // ==========================================

  /**
   * Create a new like
   * Also increments the post's like count
   */
  async create(data: CreateLikeData): Promise<Like> {
    try {
      // Use transaction to ensure consistency
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Create the like
        const like = await tx.like.create({
          data: {
            userId: data.userId,
            postId: data.postId,
          },
        });

        // 2. Increment the post's like count
        await tx.post.update({
          where: { id: data.postId },
          data: { likeCount: { increment: 1 } },
        });

        return like;
      });

      console.log("✅ Like created:", result.id);
      return result;
    } catch (error: any) {
      console.error("Error creating like:", error);
      
      // Handle duplicate like attempt
      if (error.code === "P2002") {
        throw new Error("You have already liked this post");
      }
      
      throw new Error("Failed to create like");
    }
  }

  /**
   * Remove a like (unlike)
   * Also decrements the post's like count
   */
  async delete(userId: string, postId: string): Promise<void> {
    try {
      // Use transaction to ensure consistency
      await this.prisma.$transaction(async (tx) => {
        // 1. Find and delete the like
        const deletedLike = await tx.like.deleteMany({
          where: {
            userId,
            postId,
          },
        });

        // 2. Only decrement if we actually deleted a like
        if (deletedLike.count > 0) {
          await tx.post.update({
            where: { id: postId },
            data: { likeCount: { decrement: 1 } },
          });
        }
      });

      console.log("✅ Like removed for user:", userId, "post:", postId);
    } catch (error: any) {
      console.error("Error deleting like:", error);
      throw new Error("Failed to remove like");
    }
  }

  // ==========================================
  // 🔍 QUERY OPERATIONS
  // ==========================================

  /**
   * Check if user has liked a specific post
   */
  async findByUserAndPost(userId: string, postId: string): Promise<Like | null> {
    try {
      const like = await this.prisma.like.findFirst({
        where: {
          userId,
          postId,
        },
      });

      return like;
    } catch (error: any) {
      console.error("Error finding like:", error);
      throw new Error("Failed to check like status");
    }
  }

  /**
   * Get like status for a post (combines check + count)
   * This is efficient - gets both isLiked and likeCount in minimal queries
   */
  async getLikeStatus(userId: string, postId: string): Promise<LikeStatus> {
    try {
      // Run both queries in parallel for better performance
      const [like, post] = await Promise.all([
        this.prisma.like.findFirst({
          where: { userId, postId },
        }),
        this.prisma.post.findUnique({
          where: { id: postId },
          select: { likeCount: true },
        }),
      ]);

      if (!post) {
        throw new Error("Post not found");
      }

      return {
        isLiked: !!like,
        likeCount: post.likeCount,
      };
    } catch (error: any) {
      console.error("Error getting like status:", error);
      throw new Error("Failed to get like status");
    }
  }

  /**
   * Get all likes for a specific post
   * Useful for analytics or showing who liked a post
   */
  async findByPost(postId: string): Promise<Like[]> {
    try {
      const likes = await this.prisma.like.findMany({
        where: { postId },
        orderBy: { createdAt: "desc" },
        // Could include user details if needed:
        // include: {
        //   user: {
        //     select: {
        //       id: true,
        //       username: true,
        //       displayName: true,
        //       avatar: true,
        //     }
        //   }
        // }
      });

      return likes;
    } catch (error: any) {
      console.error("Error finding likes by post:", error);
      throw new Error("Failed to get post likes");
    }
  }

  /**
   * Get posts liked by a specific user
   * Useful for "My Liked Posts" feature
   */
  async findByUser(
    userId: string, 
    options: { skip?: number; take?: number } = {}
  ): Promise<Like[]> {
    try {
      const likes = await this.prisma.like.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: options.skip || 0,
        take: options.take || 20,
        // Include post details for convenience
        include: {
          post: {
            select: {
              id: true,
              title: true,
              content: true,
              category: true,
              likeCount: true,
              createdAt: true,
            }
          }
        }
      });

      return likes;
    } catch (error: any) {
      console.error("Error finding likes by user:", error);
      throw new Error("Failed to get user likes");
    }
  }

  // ==========================================
  // 📊 ANALYTICS & UTILITIES
  // ==========================================

  /**
   * Get total number of likes for a post
   * (Alternative to cached likeCount if you prefer real-time counting)
   */
  async countByPost(postId: string): Promise<number> {
    try {
      const count = await this.prisma.like.count({
        where: { postId },
      });

      return count;
    } catch (error: any) {
      console.error("Error counting post likes:", error);
      throw new Error("Failed to count likes");
    }
  }

  /**
   * Get total number of likes given by a user
   * Useful for user statistics
   */
  async countByUser(userId: string): Promise<number> {
    try {
      const count = await this.prisma.like.count({
        where: { userId },
      });

      return count;
    } catch (error: any) {
      console.error("Error counting user likes:", error);
      throw new Error("Failed to count user likes");
    }
  }
}