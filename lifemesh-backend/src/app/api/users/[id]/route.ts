import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "../../../../utils/api-response";
import { container } from "../../../../infrastructure/container";
/**
 * Route to handle user profile operations
 * GET: Retrieve user profile
 * PUT: Update user profile
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Get user ID from URL parameter
    const userId = params.id;

    // 2. Find user by ID
    const user = await container.userRepository.findById(userId);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    // 3. Return only public profile data (no sensitive info)
    const publicProfile = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatar: user.avatar,
      reputation: user.reputation,
      level: user.level,
      createdAt: user.createdAt,
      // Note: No email, password, location, or other private data
    };

    return successResponse(
      publicProfile,
      "User profile retrieved successfully"
    );
  } catch (error: any) {
    console.error("Get user by ID error:", error);
    return errorResponse("Failed to get user profile", 500);
  }
}

export async function DELETE(
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
    if (adminUser.role !== "ADMIN") {
      return errorResponse("Access denied. Admin role required.", 403);
    }

    // 5. Get target user ID from URL
    const targetUserId = params.id;

    // 6. Check if target user exists
    const targetUser = await container.userRepository.findById(targetUserId);
    if (!targetUser) {
      return errorResponse("Target user not found", 404);
    }

    // 7. Prevent admin from deleting themselves
    if (adminUser.id === targetUserId) {
      return errorResponse("You cannot delete your own account", 400);
    }

    // 8. Delete the user
    await container.userRepository.delete(targetUserId);

    return successResponse(
      { deletedUserId: targetUserId },
      "User deleted successfully"
    );
  } catch (error: any) {
    console.error("Delete user error:", error);
    return errorResponse("Failed to delete user", 500);
  }
}
