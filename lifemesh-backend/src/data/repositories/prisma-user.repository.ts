// This is our actual "User Librarian" that knows how to work with Prisma/MySQL

import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../../core/interfaces/user-repository.interface";
import { User, CreateUserData } from "../../core/entities/user.entity";
import bcrypt from "bcryptjs";

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // ADD THIS FUNCTION
  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async create(userData: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return this.prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        displayName: userData.displayName || null, // Handle undefined
        latitude: userData.latitude || null, // Handle undefined
        longitude: userData.longitude || null, // Handle undefined
      },
    });
  }

  // ADD THIS FUNCTION
  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }
}
