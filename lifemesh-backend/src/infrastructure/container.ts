import { PrismaClient } from "@prisma/client";
import { PrismaUserRepository } from "../data/repositories/prisma-user.repository";
import { RegisterUserUseCase } from "../core/use-cases/register-user.use-case";
import { LoginUserUseCase } from "../core/use-cases/login-user.use-case";
import { JWTServiceImpl } from "../services/jwt.service";

// Singleton Prisma client
const prisma = new PrismaClient();

// Services
const jwtService = new JWTServiceImpl();

// Repositories
const userRepository = new PrismaUserRepository(prisma);

// Use Cases
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository, jwtService);

export const container = {
  // Database
  prisma,

  // Services
  jwtService,

  // Repositories
  userRepository,

  // Use Cases
  registerUserUseCase,
  loginUserUseCase,
};
