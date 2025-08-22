// src/core/entities/like.entity.ts
export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface CreateLikeData {
  userId: string;
  postId: string;
}

export interface LikeStatus {
  isLiked: boolean;
  likeCount: number;
}