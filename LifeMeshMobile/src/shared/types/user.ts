// UserRole enum (matches your Prisma schema exactly)
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

// User interface (matches your Prisma User model exactly)
export interface User {
  id: string;
  email: string;
  username: string; // ✅ Matches Prisma schema
  displayName: string | null;
  bio: string | null;
  avatar: string | null;
  role: UserRole;
  reputation: number;
  level: number;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}
