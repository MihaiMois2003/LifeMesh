// This describes what a User looks like - MUST match your database exactly
import { UserRole } from "@prisma/client";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatar: string | null;
  role: UserRole; // Now TypeScript knows about this
  reputation: number;
  level: number;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  password: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

// This describes the minimum data needed to CREATE a user
export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  displayName?: string; // Optional when creating
  latitude?: number; // Optional when creating
  longitude?: number; // Optional when creating
}
