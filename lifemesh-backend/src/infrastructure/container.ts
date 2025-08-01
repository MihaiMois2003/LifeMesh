// infrastructure/container.ts
import { PrismaClient } from "@prisma/client";
import { PrismaUserRepository } from "../data/repositories/prisma-user.repository";
import { RegisterUserUseCase } from "../core/use-cases/register-user.use-case";
import { LoginUserUseCase } from "../core/use-cases/login-user.use-case";
import { UpdateAvatarUseCase } from "../core/use-cases/update-avatar.use-case";
import { JWTServiceImpl } from "../services/jwt.service";
import { CloudinaryService } from "../services/cloudinary.service";

// 🔄 Singleton Prisma client
const prisma = new PrismaClient();

// 🛠️ Services
const jwtService = new JWTServiceImpl();
const imageUploadService = new CloudinaryService();

// 📚 Repositories
const userRepository = new PrismaUserRepository(prisma);

// 💼 Use Cases
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository, jwtService);
const updateAvatarUseCase = new UpdateAvatarUseCase(
  userRepository,
  imageUploadService
);

export const container = {
  // 🗄️ Database
  prisma,

  // 🛠️ Services
  jwtService,
  imageUploadService,

  // 📚 Repositories
  userRepository,

  // 💼 Use Cases
  registerUserUseCase,
  loginUserUseCase,
  updateAvatarUseCase, // 🆕 NEW
};
