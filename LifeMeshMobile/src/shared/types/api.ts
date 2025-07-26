import { UserRole } from "./user";

// Base API response structure (matches your backend)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Error response structure
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
}

// Login request (what we send to your backend)
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request (what we send to your backend)
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

// Login response (what your backend returns)
export interface LoginResponse {
  user: {
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
  };
  token?: string;
}

// Register response (what your backend returns)
export interface RegisterResponse {
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
