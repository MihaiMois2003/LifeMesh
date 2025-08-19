// src/data/repositories/prisma-post.repository.ts
import { PrismaClient, Category, PostStatus, PostType } from "@prisma/client";
import {
  PostRepository,
  FindPostsOptions,
  PostsResult,
  PostFilters,
  PaginationOptions,
} from "../../core/interfaces/post-repository.interface";
import {
  Post,
  CreatePostData,
  UpdatePostData,
} from "../../core/entities/post.entity";

/**
 * 🗄️ PRISMA POST REPOSITORY
 *
 * This implements our PostRepository interface using Prisma and MySQL.
 * It translates our clean business interface into actual database operations.
 *
 * Benefits:
 * - Implements the interface contract exactly
 * - Uses Prisma for type-safe database access
 * - Handles all SQL complexity behind the interface
 * - Can be swapped for different database implementations
 */
export class PrismaPostRepository implements PostRepository {
  constructor(private prisma: PrismaClient) {}

  // ==========================================
  // 📝 BASIC CRUD OPERATIONS
  // ==========================================

  /**
   * Create a new post in the database
   */
  async create(data: CreatePostData): Promise<Post> {
    try {
      const post = await this.prisma.post.create({
        data: {
          title: data.title,
          content: data.content,
          category: data.category,
          type: data.type || PostType.TEXT,
          status: PostStatus.ACTIVE,

          // Handle imageUrls properly
          imageUrls: data.imageUrls ?? undefined,

          // Location data (optional)
          address: data.address ?? undefined,
          radius: data.radius ?? undefined,
          latitude: data.latitude ?? undefined,
          longitude: data.longitude ?? undefined,

          // Author
          authorId: data.authorId,

          // Timestamps
          expiresAt: data.expiresAt || null,

          // Initialize engagement metrics
          upvotes: 0,
          downvotes: 0,
          viewCount: 0,
        },
      });

      return post;
    } catch (error) {
      console.error("Error creating post:", error);
      throw new Error("Failed to create post");
    }
  }

  /**
   * Find a post by its ID
   */
  async findById(id: string): Promise<Post | null> {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id },
      });

      return post;
    } catch (error) {
      console.error("Error finding post by ID:", error);
      throw new Error("Failed to find post");
    }
  }

  /**
   * Update an existing post
   */
  async update(id: string, data: UpdatePostData): Promise<Post> {
    try {
      // First check if post exists
      const existingPost = await this.findById(id);
      if (!existingPost) {
        throw new Error("Post not found");
      }

      const updatedPost = await this.prisma.post.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.category !== undefined && { category: data.category }),
          ...(data.type !== undefined && { type: data.type }),
          ...(data.status !== undefined && { status: data.status }),
          // Fix for imageUrls and other fields:
          ...(data.imageUrls !== undefined && {
            imageUrls: data.imageUrls ?? undefined,
          }),
          ...(data.latitude !== undefined && {
            latitude: data.latitude ?? undefined,
          }),
          ...(data.longitude !== undefined && {
            longitude: data.longitude ?? undefined,
          }),
          ...(data.address !== undefined && {
            address: data.address ?? undefined,
          }),
          ...(data.radius !== undefined && {
            radius: data.radius ?? undefined,
          }),
          ...(data.expiresAt !== undefined && {
            expiresAt: data.expiresAt ?? undefined,
          }),

          // updatedAt is automatically handled by Prisma
        },
      });

      return updatedPost;
    } catch (error) {
      console.error("Error updating post:", error);
      if (error instanceof Error && error.message === "Post not found") {
        throw error;
      }
      throw new Error("Failed to update post");
    }
  }

  /**
   * Delete a post by ID
   */
  async delete(id: string): Promise<void> {
    try {
      // First check if post exists
      const existingPost = await this.findById(id);
      if (!existingPost) {
        throw new Error("Post not found");
      }

      await this.prisma.post.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      if (error instanceof Error && error.message === "Post not found") {
        throw error;
      }
      throw new Error("Failed to delete post");
    }
  }

  // ==========================================
  // 📄 QUERY OPERATIONS
  // ==========================================

  /**
   * Find multiple posts with filtering and pagination
   * This is the main method that powers your feed!
   */
  async findMany(options: FindPostsOptions = {}): Promise<PostsResult> {
    try {
      // Build the where clause for filtering
      const whereClause = this.buildWhereClause(options);

      // Build the orderBy clause for sorting
      const orderByClause = this.buildOrderByClause(options.sortBy);

      // Get total count for pagination (before applying skip/take)
      const total = await this.prisma.post.count({
        where: whereClause,
      });

      // Get the actual posts
      const posts = await this.prisma.post.findMany({
        where: whereClause,
        orderBy: orderByClause,
        skip: options.skip || 0,
        take: options.take || 20,
      });

      // Calculate pagination info
      const pageSize = options.take || 20;
      const currentPage = Math.floor((options.skip || 0) / pageSize) + 1;

      return {
        posts,
        total,
        hasMore: (options.skip || 0) + posts.length < total,
        page: currentPage,
        pageSize,
      };
    } catch (error) {
      console.error("Error finding posts:", error);
      throw new Error("Failed to find posts");
    }
  }

  /**
   * Find posts by a specific author
   */
  async findByAuthor(
    authorId: string,
    options: PaginationOptions = {}
  ): Promise<Post[]> {
    try {
      const posts = await this.prisma.post.findMany({
        where: {
          authorId,
          status: PostStatus.ACTIVE, // Only show active posts
        },
        orderBy: { createdAt: "desc" }, // Newest first
        skip: options.skip || 0,
        take: options.take || 20,
      });

      return posts;
    } catch (error) {
      console.error("Error finding posts by author:", error);
      throw new Error("Failed to find posts by author");
    }
  }

  /**
   * Find nearby posts (simplified version for now)
   * TODO: Implement proper geospatial queries later
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    options: FindPostsOptions = {}
  ): Promise<Post[]> {
    // For now, just return all active posts
    // TODO: Implement proper distance calculation later
    console.log("Nearby search not yet implemented, returning all posts");

    const result = await this.findMany({
      ...options,
      status: PostStatus.ACTIVE,
    });

    return result.posts;
  }

  // ==========================================
  // 📊 STATISTICS & METRICS
  // ==========================================

  /**
   * Get total count of posts with optional filters
   */
  async count(filters: PostFilters = {}): Promise<number> {
    try {
      const whereClause = this.buildWhereClauseFromFilters(filters);

      return await this.prisma.post.count({
        where: whereClause,
      });
    } catch (error) {
      console.error("Error counting posts:", error);
      throw new Error("Failed to count posts");
    }
  }

  /**
   * Increment view count for a post
   */
  async incrementViewCount(id: string): Promise<void> {
    try {
      await this.prisma.post.update({
        where: { id },
        data: {
          viewCount: { increment: 1 },
        },
      });
    } catch (error) {
      console.error("Error incrementing view count:", error);
      // Don't throw error for view count failures - it's not critical
    }
  }

  // ==========================================
  // 🔧 PRIVATE HELPER METHODS
  // ==========================================

  /**
   * Builds Prisma where clause from find options
   */
  private buildWhereClause(options: FindPostsOptions) {
    const where: any = {};

    // Filter by category
    if (options.category) {
      where.category = options.category;
    }

    // Filter by status (default to ACTIVE)
    where.status = options.status || PostStatus.ACTIVE;

    // Filter by author
    if (options.authorId) {
      where.authorId = options.authorId;
    }

    // Search in title and content
    if (options.search) {
      where.OR = [
        { title: { contains: options.search } },
        { content: { contains: options.search } },
      ];
    }

    return where;
  }

  /**
   * Builds where clause from simple filters
   */
  private buildWhereClauseFromFilters(filters: PostFilters) {
    const where: any = {};

    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    if (filters.authorId) where.authorId = filters.authorId;

    if (filters.createdAfter || filters.createdBefore) {
      where.createdAt = {};
      if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
      if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
    }

    return where;
  }

  /**
   * Builds Prisma orderBy clause from sort option
   */
  private buildOrderByClause(sortBy?: string) {
    switch (sortBy) {
      case "oldest":
        return { createdAt: "asc" as const };
      case "mostLiked":
        return { upvotes: "desc" as const };
      case "mostViewed":
        return { viewCount: "desc" as const };
      case "newest":
      default:
        return { createdAt: "desc" as const };
    }
  }
}
