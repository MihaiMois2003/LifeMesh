// infrastructure/container.ts (UPDATED)
import { PrismaClient } from "@prisma/client";

// User related
import { PrismaUserRepository } from "../data/repositories/prisma-user.repository";
import { RegisterUserUseCase } from "../core/use-cases/register-user.use-case";
import { LoginUserUseCase } from "../core/use-cases/login-user.use-case";
import { UpdateAvatarUseCase } from "../core/use-cases/update-avatar.use-case";

// Post related
import { PrismaPostRepository } from "../data/repositories/prisma-post.repository";
import { CreatePostUseCase } from "../core/use-cases/create-post.use-case";
import { GetPostsUseCase } from "../core/use-cases/get-posts.use-case";
import { UploadPostImagesUseCase } from "../core/use-cases/upload-post-images.use-case";

// 🆕 Like related
import { PrismaLikeRepository } from "../data/repositories/prisma-like.repository";
import { ToggleLikeUseCase, GetLikeStatusUseCase, GetUserLikedPostsUseCase } from "../core/use-cases/toggle-like.use-case";

// Services
import { JWTServiceImpl } from "../services/jwt.service";
import { CloudinaryService } from "../services/cloudinary.service";

// ==========================================
// 🏗️ DEPENDENCY INJECTION SETUP
// ==========================================

const prisma = new PrismaClient();

// Services
const jwtService = new JWTServiceImpl();
const imageUploadService = new CloudinaryService();

// Repositories
const userRepository = new PrismaUserRepository(prisma);
const postRepository = new PrismaPostRepository(prisma);
const likeRepository = new PrismaLikeRepository(prisma); // 🆕 NEW

// Use Cases
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository, jwtService);
const updateAvatarUseCase = new UpdateAvatarUseCase(
  userRepository,
  imageUploadService
);

const createPostUseCase = new CreatePostUseCase(postRepository);
const getPostsUseCase = new GetPostsUseCase(postRepository);
const uploadPostImagesUseCase = new UploadPostImagesUseCase(
  userRepository,
  imageUploadService
);

// 🆕 NEW: Like Use Cases
const toggleLikeUseCase = new ToggleLikeUseCase(likeRepository, postRepository);
const getLikeStatusUseCase = new GetLikeStatusUseCase(likeRepository);
const getUserLikedPostsUseCase = new GetUserLikedPostsUseCase(likeRepository);

export const container = {
  // Infrastructure
  prisma,
  jwtService,
  imageUploadService,
  
  // Repositories
  userRepository,
  postRepository,
  likeRepository, // 🆕 NEW
  
  // Use Cases
  registerUserUseCase,
  loginUserUseCase,
  updateAvatarUseCase,
  createPostUseCase,
  getPostsUseCase,
  uploadPostImagesUseCase,
  
  // 🆕 NEW: Like Use Cases
  toggleLikeUseCase,
  getLikeStatusUseCase,
  getUserLikedPostsUseCase,
};