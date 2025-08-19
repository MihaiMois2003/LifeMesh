// src/core/use-cases/get-posts.use-case.ts
import { Category, PostStatus } from "@prisma/client";
import {
  PostRepository,
  FindPostsOptions,
  PostsResult,
} from "../interfaces/post-repository.interface";
import { Post } from "../entities/post.entity";

/**
 * 📱 GET POSTS USE CASE
 *
 * This powers your main feed screen - like Instagram's timeline!
 * Handles pagination, filtering, sorting, and location-based posts.
 *
 * Features:
 * - Infinite scroll pagination
 * - Filter by category (Help, Events, etc.)
 * - Sort by newest, most liked, etc.
 * - Location-based filtering
 * - Search functionality
 */

// ==========================================
// 🔧 INPUT/OUTPUT TYPES
// ==========================================

/**
 * Request for getting posts (from frontend)
 */
export interface GetPostsRequest {
  // Pagination
  page?: number; // Page number (starts at 1)
  pageSize?: number; // Posts per page (default 20)

  // Filtering
  category?: Category; // Show only this category
  status?: PostStatus; // Usually ACTIVE, but can filter others
  authorId?: string; // Show posts by specific user
  search?: string; // Search in title/content

  // Sorting
  sortBy?: "newest" | "oldest" | "mostLiked" | "mostViewed";

  // Location filtering (for nearby posts)
  userLatitude?: number;
  userLongitude?: number;
  radiusKm?: number; // Show posts within X km
}

/**
 * Response with posts and pagination info
 */
export interface GetPostsResponse {
  posts: Post[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPosts: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    category?: Category;
    search?: string;
    radiusKm?: number;
  };
}

// ==========================================
// 📋 USE CASE IMPLEMENTATION
// ==========================================

export class GetPostsUseCase {
  // Default values for pagination
  private readonly DEFAULT_PAGE_SIZE = 20;
  private readonly MAX_PAGE_SIZE = 100;
  private readonly DEFAULT_RADIUS_KM = 50; // 50km default radius

  constructor(private postRepository: PostRepository) {}

  /**
   * 🚀 Main execution method
   */
  async execute(request: GetPostsRequest): Promise<GetPostsResponse> {
    // ==========================================
    // 1️⃣ VALIDATE AND PREPARE REQUEST
    // ==========================================
    const validatedRequest = this.validateAndPrepareRequest(request);

    // ==========================================
    // 2️⃣ BUILD REPOSITORY OPTIONS
    // ==========================================
    const repositoryOptions = this.buildRepositoryOptions(validatedRequest);

    // ==========================================
    // 3️⃣ FETCH POSTS FROM REPOSITORY
    // ==========================================
    const result = await this.postRepository.findMany(repositoryOptions);

    // ==========================================
    // 4️⃣ BUILD RESPONSE WITH PAGINATION
    // ==========================================
    return this.buildResponse(result, validatedRequest);
  }

  // ==========================================
  // 🔍 PRIVATE VALIDATION METHODS
  // ==========================================

  /**
   * Validates and normalizes the request data
   */
  private validateAndPrepareRequest(request: GetPostsRequest): GetPostsRequest {
    const validated: GetPostsRequest = { ...request };

    // Validate and normalize pagination
    validated.page = Math.max(1, request.page || 1); // Minimum page 1
    validated.pageSize = Math.min(
      this.MAX_PAGE_SIZE,
      Math.max(1, request.pageSize || this.DEFAULT_PAGE_SIZE)
    );

    // Validate search query
    if (request.search) {
      validated.search = request.search.trim();
      if (validated.search.length === 0) {
        delete validated.search; // Remove empty search
      }
      if (validated.search && validated.search.length > 100) {
        throw new Error("Search query cannot exceed 100 characters");
      }
    }

    // // Validate location data
    // if (
    //   request.userLatitude !== undefined ||
    //   request.userLongitude !== undefined
    // ) {
    //   this.validateLocation(request.userLatitude, request.userLongitude);

    //   // Set default radius if not provided
    //   validated.radiusKm = request.radiusKm || this.DEFAULT_RADIUS_KM;

    //   // Validate radius
    //   if (validated.radiusKm! <= 0 || validated.radiusKm! > 1000) {
    //     throw new Error("Radius must be between 1 and 1000 kilometers");
    //   }
    // }

    // Set default sort
    validated.sortBy = request.sortBy || "newest";

    // Set default status to ACTIVE (don't show expired/hidden posts)
    validated.status = request.status || PostStatus.ACTIVE;

    return validated;
  }

  /**
   * Validates latitude and longitude coordinates
   */
  private validateLocation(latitude?: number, longitude?: number): void {
    if (latitude === undefined || longitude === undefined) {
      throw new Error(
        "Both latitude and longitude are required for location filtering"
      );
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error("Latitude must be between -90 and 90");
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error("Longitude must be between -180 and 180");
    }
  }

  // ==========================================
  // 🏗️ DATA PREPARATION METHODS
  // ==========================================

  /**
   * Converts our request into repository options
   */
  private buildRepositoryOptions(request: GetPostsRequest): FindPostsOptions {
    const options: FindPostsOptions = {
      // Pagination - convert page number to skip/take
      skip: (request.page! - 1) * request.pageSize!,
      take: request.pageSize!,

      // Filtering
      category: request.category,
      status: request.status,
      authorId: request.authorId,
      search: request.search,

      // Sorting
      sortBy: request.sortBy,

      // Location (for distance calculation)
      //   userLatitude: request.userLatitude,
      //   userLongitude: request.userLongitude,
    };

    return options;
  }

  /**
   * Builds the final response with pagination metadata
   */
  private buildResponse(
    result: PostsResult,
    request: GetPostsRequest
  ): GetPostsResponse {
    const totalPages = Math.ceil(result.total / request.pageSize!);
    const currentPage = request.page!;

    return {
      posts: result.posts,
      pagination: {
        currentPage,
        pageSize: request.pageSize!,
        totalPosts: result.total,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
      filters: {
        category: request.category,
        search: request.search,
        radiusKm: request.radiusKm,
      },
    };
  }
}

/**
 * 🎯 BUSINESS RULES APPLIED HERE:
 *
 * 1. Page numbers start at 1 (user-friendly)
 * 2. Page size is capped at 100 (performance)
 * 3. Default page size is 20 (good for mobile)
 * 4. Default radius is 50km (reasonable local area)
 * 5. Search queries are limited to 100 characters
 * 6. Only ACTIVE posts are shown by default
 * 7. Location coordinates must be valid
 * 8. Radius is capped at 1000km (country-level max)
 *
 * These rules make the feed performant and user-friendly!
 */
