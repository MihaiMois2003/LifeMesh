// data/repositories/prisma-user.repository.ts
import { PrismaClient, UserRole } from "@prisma/client";
import { UserRepository } from "../../core/interfaces/user-repository.interface";
import { User, CreateUserData } from "../../core/entities/user.entity";
import {
  UpdateUserData,
  FindManyOptions,
} from "../../core/entities/user-types";
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
        displayName: userData.displayName || null,
        latitude: userData.latitude || null,
        longitude: userData.longitude || null,
      },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: userData,
    });
  }

  async updateRole(id: string, role: UserRole): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  // 🆕 NEW: Avatar-specific update method
  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        avatar: avatarUrl,
        updatedAt: new Date(), // Explicitly update the timestamp
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findMany(options: FindManyOptions = {}): Promise<User[]> {
    return this.prisma.user.findMany({
      skip: options.skip || 0,
      take: options.take || 50,
      where: {
        role: options.role,
        isActive: options.isActive,
        OR: options.search
          ? [
              { displayName: { contains: options.search } },
              { email: { contains: options.search } },
              { username: { contains: options.search } },
            ]
          : undefined,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async count(): Promise<number> {
    return this.prisma.user.count({
      where: { isActive: true },
    });
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number
  ): Promise<User[]> {
    const latRange = radiusKm / 111;
    const lonRange = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

    return this.prisma.user.findMany({
      where: {
        latitude: { gte: latitude - latRange, lte: latitude + latRange },
        longitude: { gte: longitude - lonRange, lte: longitude + lonRange },
        isActive: true,
      },
    });
  }
}
