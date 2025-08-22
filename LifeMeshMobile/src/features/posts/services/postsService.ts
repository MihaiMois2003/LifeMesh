// src/features/posts/services/postsService.ts
import { apiClient } from "../../../shared/api/client";
import {
  Post,
  CreatePostRequest,
  CreatePostApiRequest,
  UpdatePostRequest,
  GetPostsRequest,
  GetPostsResponse,
  ApiResponse,
} from "../../../shared/types/posts";

/**
 * 🏪 POSTS API SERVICE
 *
 * This service handles all API calls related to posts.
 * Following the exact same pattern as your authService.ts
 *
 * Features:
 * - Complete CRUD operations
 * - Image upload integration with Cloudinary
 * - Comprehensive error handling
 * - Logging for debugging
 */
class PostsService {
  // ==========================================
  // 📄 GET POSTS (Feed)
  // ==========================================

  /**
   * Get posts with filtering and pagination
   * This powers your main feed screen
   */
  async getPosts(params: GetPostsRequest = {}): Promise<GetPostsResponse> {
    try {
      console.log("🔍 Fetching posts with params:", {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        category: params.category,
        search: params.search,
        sortBy: params.sortBy || "newest",
      });

      // Build query string from parameters
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page.toString());
      if (params.pageSize)
        queryParams.append("pageSize", params.pageSize.toString());
      if (params.category) queryParams.append("category", params.category);
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.authorId) queryParams.append("authorId", params.authorId);

      const url = `/api/posts${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await apiClient.get<ApiResponse<GetPostsResponse>>(url);

      console.log("✅ Posts fetched successfully:", {
        totalPosts: response.data.data.pagination.totalPosts,
        currentPage: response.data.data.pagination.currentPage,
        postsCount: response.data.data.posts.length,
      });

      return response.data.data;
    } catch (error: any) {
      console.log("❌ Failed to fetch posts:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.response?.data?.error,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        `HTTP ${error.response?.status}: ${error.response?.statusText}` ||
        "Failed to fetch posts";

      throw new Error(errorMessage);
    }
  }

  // ==========================================
  // 👤 GET MY POSTS (Profile)
  // ==========================================

  /**
   * Get current user's posts for profile screen
   */
  async getMyPosts(params: GetPostsRequest = {}): Promise<Post[]> {
    try {
      console.log("🔍 Fetching my posts");

      // Use the same getPosts endpoint but filter by current user
      // Note: Your backend will get authorId from JWT token
      const response = await this.getPosts({
        ...params,
        // Don't need to specify authorId - backend gets it from token
      });

      console.log("✅ My posts fetched successfully:", {
        postsCount: response.posts.length,
      });

      return response.posts;
    } catch (error: any) {
      console.log("❌ Failed to fetch my posts:", error.message);
      throw error;
    }
  }

  // ==========================================
  // ✏️ CREATE POST
  // ==========================================

  /**
   * Create a new post with optional image upload
   */
  async createPost(
    postData: CreatePostRequest,
    authToken: string
  ): Promise<Post> {
    try {
      console.log("🔍 Creating post:", {
        title: postData.title,
        category: postData.category,
        type: postData.type,
        hasImages: !!(postData.images?.length || postData.imageUrls?.length),
        imageCount:
          (postData.images?.length || 0) + (postData.imageUrls?.length || 0),
      });

      // Step 1: Upload images to Cloudinary if provided
      let uploadedImageUrls: string[] = [];

      if (postData.images && postData.images.length > 0) {
        console.log("📸 Uploading images to Cloudinary...");
        try {
          uploadedImageUrls = await this.uploadImages(
            postData.images,
            authToken
          );
          console.log("✅ Images uploaded successfully:", uploadedImageUrls);
        } catch (uploadError) {
          console.error("❌ Image upload failed:", uploadError);
          const uploadErrorMessage =
            uploadError instanceof Error
              ? uploadError.message
              : String(uploadError);
          throw new Error("Failed to upload images: " + uploadErrorMessage);
        }
      }

      // Combine uploaded URLs with any existing URLs
      const allImageUrls = [
        ...(uploadedImageUrls || []),
        ...(postData.imageUrls || []),
      ];

      // Step 2: Prepare API request data (NO images field, only imageUrls)
      const apiRequest = {
        title: postData.title.trim(),
        content: postData.content.trim(),
        category: postData.category,
        type: postData.type,
        latitude: postData.latitude,
        longitude: postData.longitude,
        address: postData.address?.trim(),
        radius: postData.radius,
        imageUrls: allImageUrls.length > 0 ? allImageUrls : undefined,
        expiresAt: postData.expiresAt?.toISOString(),
        // authorId will be set by backend from JWT token
      };

      console.log("🚀 Creating post with API request:", {
        ...apiRequest,
        imageUrlsCount: apiRequest.imageUrls?.length || 0,
      });

      // Step 3: Create the post
      const response = await apiClient.post<ApiResponse<{ post: Post }>>(
        "/api/posts",
        apiRequest,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log("✅ Post created successfully:", {
        postId: response.data.data.post.id,
        title: response.data.data.post.title,
        category: response.data.data.post.category,
      });

      return response.data.data.post;
    } catch (error: any) {
      console.log("❌ Failed to create post:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.response?.data?.error,
        fullError: error.response?.data,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create post";

      throw new Error(errorMessage);
    }
  }

  // ==========================================
  // 🔄 UPDATE POST
  // ==========================================

  /**
   * Update an existing post
   */
  async updatePost(
    postId: string,
    updateData: UpdatePostRequest,
    authToken: string
  ): Promise<Post> {
    try {
      console.log("🔍 Updating post:", {
        postId,
        fields: Object.keys(updateData),
      });

      // Handle image uploads if new images are provided
      let updatedImageUrls = updateData.imageUrls;

      // Note: For now, we're not handling new image uploads in updates
      // You can extend this later to handle new image uploads

      // Prepare update request
      const apiRequest = {
        ...updateData,
        expiresAt: updateData.expiresAt?.toISOString(),
      };

      const response = await apiClient.put<ApiResponse<{ post: Post }>>(
        `/api/posts?id=${postId}`,
        apiRequest,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log("✅ Post updated successfully:", {
        postId: response.data.data.post.id,
        title: response.data.data.post.title,
      });

      return response.data.data.post;
    } catch (error: any) {
      console.log("❌ Failed to update post:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.response?.data?.error,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update post";

      throw new Error(errorMessage);
    }
  }

  // ==========================================
  // 🗑️ DELETE POST
  // ==========================================

  /**
   * Delete a post
   */
  async deletePost(postId: string, authToken: string): Promise<void> {
    try {
      console.log("🔍 Deleting post:", { postId });

      await apiClient.delete<ApiResponse<{ deletedPostId: string }>>(
        `/api/posts?id=${postId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log("✅ Post deleted successfully:", { postId });
    } catch (error: any) {
      console.log("❌ Failed to delete post:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.response?.data?.error,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete post";

      throw new Error(errorMessage);
    }
  }

  // ==========================================
  // 📸 IMAGE UPLOAD (Using New Dedicated Endpoint)
  // ==========================================

  /**
   * Upload multiple images to Cloudinary
   * Uses the new dedicated post images endpoint
   */
  private async uploadImages(
    images: File[],
    authToken: string
  ): Promise<string[]> {
    try {
      console.log(`📸 Uploading ${images.length} images to Cloudinary...`);

      // Create FormData for multiple images
      const formData = new FormData();

      // Add all images to form data
      images.forEach((image, index) => {
        console.log(`📸 Adding image ${index + 1}/${images.length}:`, {
          name: image.name,
          size: `${(image.size / 1024 / 1024).toFixed(2)}MB`,
          type: image.type,
        });

        // Use numbered field names for better handling
        formData.append("images", image);
      });

      // Upload all images in one request
      const response = await apiClient.post<
        ApiResponse<{
          imageUrls: string[];
          uploadCount: number;
          message: string;
        }>
      >(
        "/api/posts/upload-images", // New dedicated endpoint
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            // Don't set Content-Type, let the browser set it for FormData
          },
        }
      );

      console.log("✅ All images uploaded successfully:", {
        count: response.data.data.uploadCount,
        urls: response.data.data.imageUrls,
        message: response.data.data.message,
      });

      return response.data.data.imageUrls;
    } catch (error: any) {
      console.log("❌ Failed to upload images:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.response?.data?.error,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to upload images";

      throw new Error(errorMessage);
    }
  }

  // ==========================================
  // 🗑️ DELETE IMAGES (Optional)
  // ==========================================

  /**
   * Delete multiple images from Cloudinary
   * Useful for cleanup when post creation fails
   */
  async deleteImages(imageUrls: string[], authToken: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting ${imageUrls.length} images...`);

      await apiClient.delete<
        ApiResponse<{
          deletedCount: number;
          failedCount: number;
          totalRequested: number;
        }>
      >("/api/posts/upload-images", {
        data: { imageUrls },
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      console.log("✅ Images deleted successfully");
    } catch (error: any) {
      console.warn("⚠️ Failed to delete some images:", error.message);
      // Don't throw error - deletion failures shouldn't break the app
    }
  }

  // ==========================================
  // 📊 GET POST BY ID (For Detail View)
  // ==========================================

  /**
   * Get a specific post by ID
   */
  async getPostById(postId: string): Promise<Post> {
    try {
      console.log("🔍 Fetching post by ID:", { postId });

      const response = await apiClient.get<ApiResponse<{ post: Post }>>(
        `/api/posts/${postId}`
      );

      console.log("✅ Post fetched successfully:", {
        postId: response.data.data.post.id,
        title: response.data.data.post.title,
      });

      return response.data.data.post;
    } catch (error: any) {
      console.log("❌ Failed to fetch post:", {
        status: error.response?.status,
        message: error.response?.data?.message,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch post";

      throw new Error(errorMessage);
    }
  }

  // ==========================================
  // 👁️ INCREMENT VIEW COUNT (Future Feature)
  // ==========================================

  /**
   * Increment view count for a post
   * Call this when user opens post detail
   */
  async incrementViewCount(postId: string): Promise<void> {
    try {
      console.log("👁️ Incrementing view count:", { postId });

      // This endpoint doesn't exist yet in your backend
      // You can implement it later
      await apiClient.post(`/api/posts/${postId}/view`);

      console.log("✅ View count incremented");
    } catch (error: any) {
      // Don't throw error for view count - it's not critical
      console.warn("⚠️ Failed to increment view count:", error.message);
    }
  }
}

// ==========================================
// 📤 EXPORT SINGLETON INSTANCE
// ==========================================

// Export a singleton instance (same pattern as your authService)
export const postsService = new PostsService();
