// src/features/posts/services/likeService.ts (CREATE THIS NEW FILE)
import { apiClient } from "../../../shared/api/client";
import { LikeStatus } from "../../../shared/types/posts";

/**
 * 👍 LIKE SERVICE
 *
 * Handles all like-related API calls from the mobile app
 * Provides clean interface for components to interact with likes
 */

export interface ToggleLikeResponse {
  success: boolean;
  data: {
    action: "liked" | "unliked";
    likeStatus: LikeStatus;
    postId: string;
    userId: string;
  };
  message: string;
}

export interface GetLikeStatusResponse {
  success: boolean;
  data: {
    likeStatus: LikeStatus;
    postId: string;
    userId?: string;
    authenticated: boolean;
  };
  message: string;
}

export class LikeService {
  /**
   * 👍 Toggle like/unlike on a post
   * This is the main method components will use
   */
  static async toggleLike(postId: string): Promise<ToggleLikeResponse> {
    try {
      console.log("📱 Toggling like for post:", postId);
      console.log("🔍 API CLIENT CONFIG:", {
        baseURL: apiClient.defaults.baseURL,
        fullURL: `${apiClient.defaults.baseURL}/posts/${postId}/like`,
      });

      const response = await apiClient.post(`/api/posts/${postId}/like`);

      console.log("✅ Like toggled successfully:", response.data.data.action);
      return response.data;
    } catch (error: any) {
      console.error("❌ Toggle like error:", error);

      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error("Post not found");
      }

      if (error.response?.status === 401) {
        throw new Error("Please log in to like posts");
      }

      if (error.response?.status === 409) {
        throw new Error("Like conflict - please try again");
      }

      // Network errors
      if (!error.response) {
        throw new Error("Network error - please check your connection");
      }

      // Generic error
      throw new Error(error.response?.data?.message || "Failed to toggle like");
    }
  }

  /**
   * 📊 Get like status for a post
   * Useful for checking current state
   */
  static async getLikeStatus(postId: string): Promise<GetLikeStatusResponse> {
    try {
      console.log("📱 Getting like status for post:", postId);

      const response = await apiClient.get(`/api/posts/${postId}/like`);

      return response.data;
    } catch (error: any) {
      console.error("❌ Get like status error:", error);

      if (error.response?.status === 404) {
        throw new Error("Post not found");
      }

      // Network errors
      if (!error.response) {
        throw new Error("Network error - please check your connection");
      }

      throw new Error(
        error.response?.data?.message || "Failed to get like status"
      );
    }
  }

  /**
   * ❌ Explicit unlike (if you want separate unlike button)
   * Most apps use toggle, but this is here for completeness
   */
  static async unlikePost(postId: string): Promise<ToggleLikeResponse> {
    try {
      console.log("📱 Unliking post:", postId);

      const response = await apiClient.delete(`/api/posts/${postId}/like`);

      console.log("✅ Post unliked successfully");
      return response.data;
    } catch (error: any) {
      console.error("❌ Unlike post error:", error);

      if (error.response?.status === 404) {
        throw new Error("Post not found");
      }

      if (error.response?.status === 400) {
        throw new Error("You haven't liked this post");
      }

      // Network errors
      if (!error.response) {
        throw new Error("Network error - please check your connection");
      }

      throw new Error(error.response?.data?.message || "Failed to unlike post");
    }
  }
}
