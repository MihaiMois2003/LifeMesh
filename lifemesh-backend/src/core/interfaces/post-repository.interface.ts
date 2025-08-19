// src/core/interfaces/post-repository.interface.ts
import { Category, PostStatus } from "@prisma/client";
import {
  Post,
  CreatePostData,
  UpdatePostData,
  PostPreview,
} from "../entities/post.entity";

/**
 * 🏪 POST REPOSITORY INTERFACE
 *
 * This is a "contract" that defines what operations we need for posts.
 * Any class that implements this interface MUST provide these methods.
 *
 * Benefits:
 * - Business logic doesn't depend on specific database
 * - Easy to test with mock implementations
 * - Can switch from MySQL to PostgreSQL without changing use cases
 * - Forces consistent API across different implementations
 */
export interface PostRepository {
  // ==========================================
  // 📝 BASIC CRUD OPERATIONS
  // ==========================================

  /**
   * Create a new post
   * @param data - The post data to create
   * @returns Promise<Post> - The created post with generated ID and timestamps
   */
  create(data: CreatePostData): Promise<Post>;

  /**
   * Find a post by its ID
   * @param id - The post ID
   * @returns Promise<Post | null> - The post if found, null if not
   */
  findById(id: string): Promise<Post | null>;

  /**
   * Update an existing post
   * @param id - The post ID to update
   * @param data - The fields to update
   * @returns Promise<Post> - The updated post
   * @throws Error if post not found
   */
  update(id: string, data: UpdatePostData): Promise<Post>;

  /**
   * Delete a post by ID
   * @param id - The post ID to delete
   * @returns Promise<void>
   * @throws Error if post not found
   */
  delete(id: string): Promise<void>;

  // ==========================================
  // 📄 QUERY OPERATIONS
  // ==========================================

  /**
   * Find multiple posts with filtering and pagination
   * @param options - Search and pagination options
   * @returns Promise<PostsResult> - Posts array with pagination info
   */
  findMany(options?: FindPostsOptions): Promise<PostsResult>;

  /**
   * Find posts by author
   * @param authorId - The user ID who created the posts
   * @param options - Pagination options
   * @returns Promise<Post[]> - Array of posts by this author
   */
  findByAuthor(authorId: string, options?: PaginationOptions): Promise<Post[]>;

  //   /**
  //    * Find posts within geographic area
  //    * @param latitude - Center point latitude
  //    * @param longitude - Center point longitude
  //    * @param radiusKm - Search radius in kilometers
  //    * @param options - Additional filtering options
  //    * @returns Promise<Post[]> - Posts within the area
  //    */
  //   findNearby(
  //     latitude: number,
  //     longitude: number,
  //     radiusKm: number,
  //     options?: FindPostsOptions
  //   ): Promise<Post[]>;

  // ==========================================
  // 📊 STATISTICS & METRICS
  // ==========================================

  /**
   * Get total count of posts (for pagination)
   * @param filters - Optional filters to apply
   * @returns Promise<number> - Total count
   */
  count(filters?: PostFilters): Promise<number>;

  /**
   * Increment view count for a post
   * @param id - Post ID
   * @returns Promise<void>
   */
  incrementViewCount(id: string): Promise<void>;
}

// ==========================================
// 🔧 SUPPORTING TYPES
// ==========================================

/**
 * Options for finding multiple posts
 */
export interface FindPostsOptions {
  // Pagination
  skip?: number; // Number of posts to skip (for pagination)
  take?: number; // Number of posts to take (page size)

  // Filtering
  category?: Category; // Filter by category
  status?: PostStatus; // Filter by status (ACTIVE, RESOLVED, etc.)
  authorId?: string; // Filter by author
  search?: string; // Search in title/content

  // Sorting
  sortBy?: "newest" | "oldest" | "mostLiked" | "mostViewed";

  //   // Location (if provided, includes distance calculation)
  //   userLatitude?: number;
  //   userLongitude?: number;
}

/**
 * Simple pagination options
 */
export interface PaginationOptions {
  skip?: number;
  take?: number;
}

/**
 * Result structure for paginated posts
 */
export interface PostsResult {
  posts: Post[]; // The actual posts
  total: number; // Total count (for pagination)
  hasMore: boolean; // Whether there are more posts available
  page: number; // Current page number
  pageSize: number; // Posts per page
}

/**
 * Filters for counting posts
 */
export interface PostFilters {
  category?: Category;
  status?: PostStatus;
  authorId?: string;
  createdAfter?: Date; // Posts created after this date
  createdBefore?: Date; // Posts created before this date
}
