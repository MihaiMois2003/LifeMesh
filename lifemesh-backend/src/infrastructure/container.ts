// infrastructure/container.ts
import { PrismaClient } from "@prisma/client";

import { PrismaUserRepository } from "../data/repositories/prisma-user.repository";
import { RegisterUserUseCase } from "../core/use-cases/register-user.use-case";
import { LoginUserUseCase } from "../core/use-cases/login-user.use-case";
import { UpdateAvatarUseCase } from "../core/use-cases/update-avatar.use-case";

import { PrismaPostRepository } from "../data/repositories/prisma-post.repository";
import { CreatePostUseCase } from "../core/use-cases/create-post.use-case";
import { GetPostsUseCase } from "../core/use-cases/get-posts.use-case";
import { UploadPostImagesUseCase } from "../core/use-cases/upload-post-images.use-case";

import { JWTServiceImpl } from "../services/jwt.service";
import { CloudinaryService } from "../services/cloudinary.service";

const prisma = new PrismaClient();

const jwtService = new JWTServiceImpl();
const imageUploadService = new CloudinaryService();

const userRepository = new PrismaUserRepository(prisma);
const postRepository = new PrismaPostRepository(prisma);

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

export const container = {
  prisma,
  jwtService,
  imageUploadService,
  userRepository,
  postRepository,
  registerUserUseCase,
  loginUserUseCase,
  updateAvatarUseCase,
  createPostUseCase,
  getPostsUseCase,
  uploadPostImagesUseCase,
};
