// src/core/use-cases/create-post.use-case.ts
import { Category, PostType, PostStatus } from "@prisma/client";
import { PostRepository } from "../interfaces/post-repository.interface";
import { Post, CreatePostData } from "../entities/post.entity";

/**
 * 📝 CREATE POST USE CASE
 *
 * This contains all the business logic for creating a new post.
 * It validates data, applies business rules, and coordinates with the repository.
 *
 * Benefits:
 * - All post creation logic in one place
 * - Easy to test (no HTTP or database dependencies)
 * - Can be reused from different entry points (API, CLI, etc.)
 * - Business rules are explicit and documented
 */

// ==========================================
// 🔧 INPUT/OUTPUT TYPES
// ==========================================

/**
 * Input data for creating a post
 * This is what the API or frontend sends us
 */
export interface CreatePostRequest {
  title: string;
  content: string;
  category: Category;
  type?: PostType; // Optional, defaults to TEXT

  // Location data (all optional)
  latitude?: number;
  longitude?: number;
  address?: string;
  radius?: number; // Coverage area in meters

  //Media
  imageUrls?: string[]; // Array of image URLs

  // Optional expiration
  expiresAt?: Date;

  // Author info
  authorId: string;
}

/**
 * Output data after creating a post
 * This is what we send back to the frontend
 */
export interface CreatePostResponse {
  post: Post;
  message: string;
}

// ==========================================
// 📋 USE CASE IMPLEMENTATION
// ==========================================

export class CreatePostUseCase {
  /**
   * Constructor - Dependency Injection
   * We inject the repository interface, not a concrete implementation
   * This makes testing easy and follows SOLID principles
   */
  constructor(private postRepository: PostRepository) {}

  /**
   * 🚀 Main execution method
   * This is where all the business logic happens
   */
  async execute(request: CreatePostRequest): Promise<CreatePostResponse> {
    // ==========================================
    // 1️⃣ VALIDATE INPUT DATA
    // ==========================================
    this.validateRequest(request);

    // ==========================================
    // 2️⃣ APPLY BUSINESS RULES
    // ==========================================
    const postData = this.preparePostData(request);

    // ==========================================
    // 3️⃣ CREATE THE POST
    // ==========================================
    const createdPost = await this.postRepository.create(postData);

    // ==========================================
    // 4️⃣ RETURN SUCCESS RESPONSE
    // ==========================================
    return {
      post: createdPost,
      message: "Post created successfully",
    };
  }

  // ==========================================
  // 🔍 PRIVATE VALIDATION METHODS
  // ==========================================

  /**
   * Validates the incoming request data
   * Throws descriptive errors if validation fails
   */
  private validateRequest(request: CreatePostRequest): void {
    // Title validation
    if (!request.title || request.title.trim().length === 0) {
      throw new Error("Title is required");
    }

    if (request.title.length > 200) {
      throw new Error("Title cannot exceed 200 characters");
    }

    // Content validation
    if (!request.content || request.content.trim().length === 0) {
      throw new Error("Content is required");
    }

    if (request.content.length > 5000) {
      throw new Error("Content cannot exceed 5000 characters");
    }

    // Category validation
    if (!request.category) {
      throw new Error("Category is required");
    }

    // Author validation
    if (!request.authorId || request.authorId.trim().length === 0) {
      throw new Error("Author ID is required");
    }

    // Location validation (if provided)
    if (request.latitude !== undefined || request.longitude !== undefined) {
      this.validateLocation(request.latitude, request.longitude);
    }

    // Radius validation (if provided)
    if (request.radius !== undefined) {
      if (request.radius < 0 || request.radius > 50000) {
        // Max 50km radius
        throw new Error("Radius must be between 0 and 50000 meters");
      }
    }

    // Expiration validation (if provided)
    if (request.expiresAt) {
      const now = new Date();
      if (request.expiresAt <= now) {
        throw new Error("Expiration date must be in the future");
      }

      // Max 1 year in the future
      const maxExpiration = new Date();
      maxExpiration.setFullYear(maxExpiration.getFullYear() + 1);
      if (request.expiresAt > maxExpiration) {
        throw new Error(
          "Expiration date cannot be more than 1 year in the future"
        );
      }
    }
  }

  /**
   * Validates latitude and longitude coordinates
   */
  private validateLocation(latitude?: number, longitude?: number): void {
    if (latitude === undefined || longitude === undefined) {
      throw new Error(
        "Both latitude and longitude are required when providing location"
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
   * Prepares the data for repository creation
   * Applies business rules and defaults
   */
  private preparePostData(request: CreatePostRequest): CreatePostData {
    const postData: CreatePostData = {
      title: request.title.trim(),
      content: request.content.trim(),
      category: request.category,
      type: request.type || PostType.TEXT,
      authorId: request.authorId,
    };

    // Add location data if provided
    if (request.latitude !== undefined && request.longitude !== undefined) {
      postData.latitude = request.latitude;
      postData.longitude = request.longitude;
      postData.address = request.address?.trim() || undefined;
      postData.radius = request.radius || undefined;
    }

    // Add image URLs if provided (ADD THIS)
    if (request.imageUrls && request.imageUrls.length > 0) {
      postData.imageUrls = request.imageUrls;
    }

    // Add expiration if provided
    if (request.expiresAt) {
      postData.expiresAt = request.expiresAt;
    }

    return postData;
  }
}

/**
 * 🎯 BUSINESS RULES APPLIED HERE:
 *
 * 1. Title is required and has length limits
 * 2. Content is required and has length limits
 * 3. Category is mandatory
 * 4. Author must be specified
 * 5. Location coordinates must be valid if provided
 * 6. Radius has reasonable limits (max 50km)
 * 7. Expiration must be in future but not too far
 * 8. Default post type is TEXT
 * 9. All text is trimmed of whitespace
 *
 * These rules are in ONE place and easy to modify!
 */
