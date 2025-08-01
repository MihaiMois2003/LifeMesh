// core/interfaces/user-repository.interface.ts
import { User, CreateUserData } from "../entities/user.entity";
import { UpdateUserData, FindManyOptions } from "../entities/user-types";
import { UserRole } from "@prisma/client";

export interface UserRepository {
  // Find functions
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;

  // Create function
  create(userData: CreateUserData): Promise<User>;

  // Update functions
  updateLastLogin(id: string): Promise<void>;
  update(id: string, userData: UpdateUserData): Promise<User>;
  updateRole(id: string, role: UserRole): Promise<void>;

  // 🆕 NEW: Avatar-specific update method
  updateAvatar(userId: string, avatarUrl: string): Promise<User>;

  // Delete operations
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;

  // Enhanced read operations
  findMany(options?: FindManyOptions): Promise<User[]>;
  findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number
  ): Promise<User[]>;
  count(): Promise<number>;
}
