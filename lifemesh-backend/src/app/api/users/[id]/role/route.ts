import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
} from "../../../../../utils/api-response";
import { container } from "../../../../../infrastructure/container";
import { UserRole } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Get JWT token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("No valid token provided", 401);
    }

    // 2. Extract and verify token
    const token = authHeader.substring(7);
    const decoded = container.jwtService.verifyToken(token);
    if (!decoded) {
      return errorResponse("Invalid or expired token", 401);
    }

    // 3. Get admin user to check role
    const adminUser = await container.userRepository.findById(decoded.userId);
    if (!adminUser) {
      return errorResponse("User not found", 404);
    }

    // 4. Check if user is admin
    if (adminUser.role !== UserRole.ADMIN) {
      return errorResponse("Access denied. Admin role required.", 403);
    }

    // 5. Get target user ID and new role from request
    const targetUserId = params.id;
    const body = await request.json();
    const { role } = body;

    // 6. Validate new role
    if (!role || !Object.values(UserRole).includes(role)) {
      return errorResponse("Invalid role. Must be USER or ADMIN", 400);
    }

    // 7. Check if target user exists
    const targetUser = await container.userRepository.findById(targetUserId);
    if (!targetUser) {
      return errorResponse("Target user not found", 404);
    }

    // 8. Prevent admin from changing their own role (safety feature)
    if (adminUser.id === targetUserId) {
      return errorResponse("You cannot change your own role", 400);
    }

    // 9. Update user role
    await container.userRepository.updateRole(targetUserId, role);

    // 10. Get updated user for response
    const updatedUser = await container.userRepository.findById(targetUserId);
    const { password, ...userResponse } = updatedUser!;

    return successResponse(
      userResponse,
      `User role updated to ${role} successfully`
    );
  } catch (error: any) {
    console.error("Update user role error:", error);
    return errorResponse("Failed to update user role", 500);
  }
}
