// This describes what our "User Librarian" can do

import { User, CreateUserData } from "../entities/user.entity";

export interface UserRepository {
  // Find functions
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>; // ADD THIS

  // Create function
  create(userData: CreateUserData): Promise<User>;

  // Update function
  updateLastLogin(id: string): Promise<void>; // ADD THIS
}
