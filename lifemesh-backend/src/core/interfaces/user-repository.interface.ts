// This describes what our "User Librarian" can do

import { User, CreateUserData } from "../entities/user.entity";
import { UpdateUserData, FindManyOptions } from "../entities/user-types"; // Import the new types
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

  // Delete operations
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>; // Mark as inactive instead of deleting

  // Enhanced read operations
  findMany(options?: FindManyOptions): Promise<User[]>;
  findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number
  ): Promise<User[]>;
  count(): Promise<number>;
}
