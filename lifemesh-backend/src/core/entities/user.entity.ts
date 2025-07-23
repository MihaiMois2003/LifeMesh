// This describes what a User looks like - MUST match your database exactly

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null; // Can be null (from database)
  bio: string | null; // Can be null
  avatar: string | null; // Can be null
  reputation: number;
  level: number;
  latitude: number | null; // Can be null
  longitude: number | null; // Can be null
  address: string | null; // Can be null
  password: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null; // Can be null
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
