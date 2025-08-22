// src/core/entities/post.entity.ts (REPLACE ENTIRE FILE)
import { Category, PostType, PostStatus } from "@prisma/client";

/**
 * 👤 AUTHOR DETAILS
 * Represents the author information included with posts
 */
export interface PostAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  isVerified: boolean;
}

/**
 * 🎯 POST ENTITY (UPDATED)
 * This represents a Post with author details included
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

  // Media
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
  
  // 🆕 Author details (from Prisma include)
  author: PostAuthor;
}

/**
 * 🏗️ CREATE POST DATA
 * For creating posts - doesn't include author details since they're added via include
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

  // Media
  imageUrls?: string[]; // Array of image URLs

  // Author is required
  authorId: string;

  // Optional expiration
  expiresAt?: Date;
}

/**
 * 🔄 UPDATE POST DATA
 * For updating posts - doesn't affect author relationship
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

  // Media updates
  imageUrls?: string[] | null;

  // Expiration updates
  expiresAt?: Date | null;
}

/**
 * 📄 POST PREVIEW
 * Lightweight version for lists/feeds
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