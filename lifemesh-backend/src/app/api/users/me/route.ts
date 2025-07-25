import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "../../../../utils/api-response";
import { container } from "../../../../infrastructure/container";
/**
 * Route to handle user profile operations
 * GET: Retrieve user profile
 * PUT: Update user profile
 */

export async function GET(request: NextRequest) {
  try {
    // 1. Get JWT token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("No valid token provided", 401);
    }

    // 2. Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // 3. Verify JWT token
    const decoded = container.jwtService.verifyToken(token);
    if (!decoded) {
      return errorResponse("Invalid or expired token", 401);
    }

    // 4. Get user from database
    const user = await container.userRepository.findById(decoded.userId);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    // 5. Remove password from response
    const { password, ...userResponse } = user;

    // 6. Return user profile
    return successResponse(userResponse, "Profile retrieved successfully");
  } catch (error: any) {
    console.error("Get profile error:", error);
    return errorResponse("Failed to get profile", 500);
  }
}

export async function PUT(request: NextRequest) {
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

    // 3. Get update data from request body
    const body = await request.json();

    // 4. Update user profile
    const updatedUser = await container.userRepository.update(
      decoded.userId,
      body
    );

    // 5. Remove password from response
    const { password, ...userResponse } = updatedUser;

    // 6. Return updated profile
    return successResponse(userResponse, "Profile updated successfully");
  } catch (error: any) {
    console.error("Update profile error:", error);
    return errorResponse("Failed to update profile", 500);
  }
}
