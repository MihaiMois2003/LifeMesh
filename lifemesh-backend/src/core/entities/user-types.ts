import { UserRole } from "@prisma/client";

// Data needed to update a user
export interface UpdateUserData {
  displayName?: string;
  bio?: string;
  avatar?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

// Options for finding multiple users
export interface FindManyOptions {
  skip?: number; // For pagination
  take?: number; // How many to return
  role?: UserRole; // Filter by role
  isActive?: boolean; // Filter by active status
  search?: string; // Search by name/email
}
