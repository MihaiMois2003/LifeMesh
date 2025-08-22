// src/core/interfaces/like-repository.interface.ts
import { Like, CreateLikeData, LikeStatus } from "../entities/like.entity";

export interface LikeRepository {
  // Core operations
  create(data: CreateLikeData): Promise<Like>;
  delete(userId: string, postId: string): Promise<void>;
  
  // Check if user liked post
  findByUserAndPost(userId: string, postId: string): Promise<Like | null>;
  
  // Get like status (combines check + count)
  getLikeStatus(userId: string, postId: string): Promise<LikeStatus>;
  
  // Get all likes for a post
  findByPost(postId: string): Promise<Like[]>;
  
  // Get posts liked by user
  findByUser(userId: string, options?: { skip?: number; take?: number }): Promise<Like[]>;
}