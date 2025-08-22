// src/shared/types/posts.ts
// Complete types matching your Prisma schema exactly

// ==========================================
// 🏷️ ENUMS (Matching Prisma Schema)
// ==========================================

export enum Category {
  HELP_REQUEST = "HELP_REQUEST",
  DONATION = "DONATION",
  EVENT = "EVENT",
  ALERT = "ALERT",
  SOCIAL = "SOCIAL",
  MARKETPLACE = "MARKETPLACE",
  CIVIC = "CIVIC",
  GENERAL = "GENERAL",
}

export enum PostType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  EVENT = "EVENT",
  HELP_REQUEST = "HELP_REQUEST",
  DONATION_OFFER = "DONATION_OFFER",
  LOST_AND_FOUND = "LOST_AND_FOUND",
  ANNOUNCEMENT = "ANNOUNCEMENT",
}

export enum PostStatus {
  ACTIVE = "ACTIVE",
  RESOLVED = "RESOLVED",
  EXPIRED = "EXPIRED",
  HIDDEN = "HIDDEN",
  REPORTED = "REPORTED",
}

// ==========================================
// 🎯 CORE POST INTERFACE
// ==========================================

/**
 * 👤 POST AUTHOR
 * Author details included with posts
 */
export interface PostAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  isVerified: boolean;
}

/**
 * 🎯 POST INTERFACE (UPDATED)
 * Complete Post interface with author details
 */
export interface Post {
  // Core identification
  id: string;
  title: string;
  content: string;

  // Classification
  category: Category;
  type: PostType;
  status: PostStatus;

  // Location (all optional)
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  radius?: number | null; // Coverage area in meters

  // Media - array of Cloudinary URLs
  imageUrls?: string[] | null;

  // Engagement metrics
  upvotes: number;
  downvotes: number;
  viewCount: number;

  // AI metadata (future features)
  aiCategory?: string | null;
  aiConfidence?: number | null;

  // Timestamps
  createdAt: string; // ISO date string from API
  updatedAt: string; // ISO date string from API
  expiresAt?: string | null; // ISO date string from API

  // Author relationship
  authorId: string;
  
  // 🆕 Author details (from backend include)
  author: PostAuthor;
}

// ==========================================
// 🏗️ CREATE POST INTERFACES
// ==========================================

/**
 * Data needed to create a new post
 * This is what our frontend form will collect
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
  radius?: number;

  // Media - will be uploaded to Cloudinary first
  images?: File[]; // Browser File objects
  imageUrls?: string[]; // Already uploaded Cloudinary URLs

  // Optional expiration
  expiresAt?: Date;
}

/**
 * API request format (after processing form data)
 * This matches your backend's createPostSchema
 */
export interface CreatePostApiRequest {
  title: string;
  content: string;
  category: Category;
  type?: PostType;
  latitude?: number;
  longitude?: number;
  address?: string;
  radius?: number;
  imageUrls?: string[];
  expiresAt?: string; // ISO string
  authorId: string; // Added by API from JWT token
}

// ==========================================
// 🔄 UPDATE POST INTERFACES
// ==========================================

/**
 * Data for updating an existing post
 * All fields optional since you might only update some
 */
export interface UpdatePostRequest {
  title?: string;
  content?: string;
  category?: Category;
  type?: PostType;
  status?: PostStatus;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  radius?: number | null;
  imageUrls?: string[] | null;
  expiresAt?: Date | null;
}

// ==========================================
// 📄 QUERY & FILTER INTERFACES
// ==========================================

/**
 * Options for getting posts (matches your backend)
 */
export interface GetPostsRequest {
  // Pagination
  page?: number; // Page number (starts at 1)
  pageSize?: number; // Posts per page

  // Filtering
  category?: Category;
  search?: string; // Search in title/content
  authorId?: string; // Show posts by specific user

  // Sorting
  sortBy?: "newest" | "oldest" | "mostLiked" | "mostViewed";

  // Location filtering (future feature)
  userLatitude?: number;
  userLongitude?: number;
  radiusKm?: number;
}

/**
 * Response from get posts API
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
// 🎨 UI-SPECIFIC INTERFACES
// ==========================================

/**
 * Post with additional UI-specific data
 * Used in components for display logic
 */
export interface PostWithMetadata extends Post {
  // Calculated fields
  distanceKm?: number; // Distance from user
  timeAgo?: string; // "2 hours ago"
  isOwn?: boolean; // Is this user's post

  // UI state
  isLiked?: boolean; // Has user liked this post
  isBookmarked?: boolean; // Has user bookmarked this post
}

/**
 * Lightweight post for feed/list displays
 * Reduces data transfer and improves performance
 */
export interface PostPreview {
  id: string;
  title: string;
  content: string; // Might be truncated
  category: Category;
  upvotes: number;
  downvotes: number;
  viewCount: number;
  authorId: string;
  createdAt: string;
  imageUrls?: string[];

  // Distance info (calculated, not stored)
  distanceKm?: number;
}

// ==========================================
// 🏪 API RESPONSE WRAPPERS
// ==========================================

/**
 * Standard API response wrapper (matches your backend)
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

/**
 * Error response format
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
}

// ==========================================
// 📊 CATEGORY HELPERS
// ==========================================

/**
 * Category display information for UI
 */
export interface CategoryInfo {
  key: Category;
  label: string;
  icon: string; // Ionicon name
  color: string; // Hex color
  description: string;
}

/**
 * All categories with display info
 * Used for category pickers, filters, etc.
 */
export const CATEGORY_INFO: Record<Category, CategoryInfo> = {
  [Category.HELP_REQUEST]: {
    key: Category.HELP_REQUEST,
    label: "Help Request",
    icon: "hand-right-outline",
    color: "#ef4444",
    description: "Ask for help from your community",
  },
  [Category.DONATION]: {
    key: Category.DONATION,
    label: "Donation",
    icon: "gift-outline",
    color: "#22c55e",
    description: "Give away items or offer donations",
  },
  [Category.EVENT]: {
    key: Category.EVENT,
    label: "Event",
    icon: "calendar-outline",
    color: "#3b82f6",
    description: "Community events and gatherings",
  },
  [Category.ALERT]: {
    key: Category.ALERT,
    label: "Alert",
    icon: "warning-outline",
    color: "#f59e0b",
    description: "Important local alerts and warnings",
  },
  [Category.SOCIAL]: {
    key: Category.SOCIAL,
    label: "Social",
    icon: "people-outline",
    color: "#8b5cf6",
    description: "Social activities and meetups",
  },
  [Category.MARKETPLACE]: {
    key: Category.MARKETPLACE,
    label: "Marketplace",
    icon: "storefront-outline",
    color: "#06b6d4",
    description: "Buy, sell, or trade items",
  },
  [Category.CIVIC]: {
    key: Category.CIVIC,
    label: "Civic",
    icon: "library-outline",
    color: "#64748b",
    description: "Community issues and civic matters",
  },
  [Category.GENERAL]: {
    key: Category.GENERAL,
    label: "General",
    icon: "chatbubble-outline",
    color: "#6b7280",
    description: "General community discussion",
  },
};

// ==========================================
// 🔧 UTILITY TYPES
// ==========================================

/**
 * Filter options for posts
 */
export type PostFilters = {
  category?: Category;
  status?: PostStatus;
  search?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
};

/**
 * Sort options for posts
 */
export type PostSortOption = "newest" | "oldest" | "mostLiked" | "mostViewed";

/**
 * Post loading states
 */
export type PostLoadingState =
  | "idle"
  | "loading"
  | "creating"
  | "updating"
  | "deleting"
  | "error";
