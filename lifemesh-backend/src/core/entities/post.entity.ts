// src/core/entities/post.entity.ts
import { Category, PostType, PostStatus } from "@prisma/client";

/**
 * 🎯 POST ENTITY
 *
 * This represents a Post in our business domain.
 * It matches your Prisma schema but is independent of the database.
 *
 * Why separate this from Prisma?
 * - Business logic shouldn't depend on database implementation
 * - Easier to test (no database required)
 * - Can evolve independently
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

  // Location (optional)
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  radius?: number | null; // Area coverage in meters

  // Media (we'll implement this later)
  imageUrls?: any; // Prisma JsonValue type

  // Engagement metrics
  upvotes: number;
  downvotes: number;
  viewCount: number;

  // AI metadata (future feature)
  aiCategory?: string | null;
  aiConfidence?: number | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date | null;

  // Author relationship
  authorId: string;
  // Note: We don't include the full User object here to avoid circular dependencies
}

/**
 * 🏗️ CREATE POST DATA
 *
 * This defines what data is needed to create a new post.
 * It's a subset of the full Post interface.
 */
export interface CreatePostData {
  title: string;
  content: string;
  category: Category;
  type?: PostType; // Optional, defaults to TEXT

  // Location (all optional)
  latitude?: number;
  longitude?: number;
  address?: string;
  radius?: number;

  //Media
  imageUrls?: string[]; // Array of image URLs

  // Author is required
  authorId: string;

  // Optional expiration
  expiresAt?: Date;
}

/**
 * 🔄 UPDATE POST DATA
 *
 * Defines what fields can be updated after creation.
 * Notice: authorId cannot be changed, createdAt is immutable.
 */
export interface UpdatePostData {
  title?: string;
  content?: string;
  category?: Category;
  type?: PostType;
  status?: PostStatus;

  // Location updates
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  radius?: number | null;

  // Media updates (future)
  imageUrls?: string[] | null;

  // Expiration updates
  expiresAt?: Date | null;
}

/**
 * 📄 POST PREVIEW
 *
 * A lightweight version for lists/feeds.
 * Contains only essential info to display in a list.
 */
export interface PostPreview {
  id: string;
  title: string;
  content: string; // Maybe truncated
  category: Category;
  upvotes: number;
  downvotes: number;
  authorId: string;
  createdAt: Date;

  // Distance info (calculated, not stored)
  distanceKm?: number;
}
