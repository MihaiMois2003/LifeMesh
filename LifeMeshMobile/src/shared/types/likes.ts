// src/shared/types/likes.ts (CREATE THIS NEW FILE)

/**
 * 👍 LIKE TYPES
 * 
 * TypeScript interfaces for like-related data
 * Shared between components and services
 */

export interface LikeStatus {
  isLiked: boolean;
  likeCount: number;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

/**
 * Extended post interface with like information
 * This is what components receive after like operations
 */
export interface PostWithLikeStatus {
  id: string;
  title: string;
  content: string;
  // ... other post fields
  likeCount: number;
  isLikedByCurrentUser?: boolean; // Added by frontend logic
}