// infrastructure/container.ts
import { PrismaClient } from "@prisma/client";

// 🧑‍💼 User repositories and use cases (existing)
import { PrismaUserRepository } from "../data/repositories/prisma-user.repository";
import { RegisterUserUseCase } from "../core/use-cases/register-user.use-case";
import { LoginUserUseCase } from "../core/use-cases/login-user.use-case";
import { UpdateAvatarUseCase } from "../core/use-cases/update-avatar.use-case";

// 📝 NEW: Post repositories and use cases
import { PrismaPostRepository } from "../data/repositories/prisma-post.repository";
import { CreatePostUseCase } from "../core/use-cases/create-post.use-case";
import { GetPostsUseCase } from "../core/use-cases/get-posts.use-case";

// 🛠️ Services (existing)
import { JWTServiceImpl } from "../services/jwt.service";
import { CloudinaryService } from "../services/cloudinary.service";

/**
 * 🏗️ DEPENDENCY INJECTION CONTAINER
 *
 * This is where we wire everything together following the dependency injection pattern.
 * All our use cases, repositories, and services are configured here.
 *
 * Benefits:
 * - Single place to configure all dependencies
 * - Easy to swap implementations for testing
 * - Clear dependency graph
 * - Follows SOLID principles
 */

// ==========================================
// 🗄️ DATABASE & INFRASTRUCTURE
// ==========================================

// 🔄 Singleton Prisma client (shared across all repositories)
const prisma = new PrismaClient();

// ==========================================
// 🛠️ SERVICES LAYER
// ==========================================

// Authentication & file services
const jwtService = new JWTServiceImpl();
const imageUploadService = new CloudinaryService();

// ==========================================
// 📚 REPOSITORIES LAYER
// ==========================================

// User data access
const userRepository = new PrismaUserRepository(prisma);

// 📝 NEW: Post data access
const postRepository = new PrismaPostRepository(prisma);

// ==========================================
// 💼 USE CASES LAYER (Business Logic)
// ==========================================

// User-related use cases (existing)
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository, jwtService);
const updateAvatarUseCase = new UpdateAvatarUseCase(
  userRepository,
  imageUploadService
);

// 📝 NEW: Post-related use cases
const createPostUseCase = new CreatePostUseCase(postRepository);
const getPostsUseCase = new GetPostsUseCase(postRepository);

// ==========================================
// 🎯 EXPORTED CONTAINER
// ==========================================

/**
 * The main container that exposes all our configured dependencies.
 * API routes will use this to access the business logic.
 */
export const container = {
  // 🗄️ Database
  prisma,

  // 🛠️ Services
  jwtService,
  imageUploadService,

  // 📚 Repositories
  userRepository,
  postRepository, // 🆕 NEW

  // 💼 User Use Cases (existing)
  registerUserUseCase,
  loginUserUseCase,
  updateAvatarUseCase,

  // 📝 Post Use Cases (NEW)
  createPostUseCase, // 🆕 NEW
  getPostsUseCase, // 🆕 NEW
};
