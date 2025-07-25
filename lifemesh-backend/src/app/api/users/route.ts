import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "../../../utils/api-response";
import { container } from "../../../infrastructure/container";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
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

    // 3. Get user to check role
    const user = await container.userRepository.findById(decoded.userId);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    // 4. Check if user is admin
    if (user.role !== UserRole.ADMIN) {
      return errorResponse("Access denied. Admin role required.", 403);
    }

    // 5. Get query parameters for pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || undefined;

    // 6. Get users with pagination
    const users = await container.userRepository.findMany({
      skip: (page - 1) * limit,
      take: limit,
      search: search,
    });

    // 7. Remove passwords from all users
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    // 8. Get total count for pagination info
    const totalUsers = await container.userRepository.count();

    // 9. Return paginated results
    return successResponse(
      {
        users: usersWithoutPasswords,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit),
        },
      },
      "Users retrieved successfully"
    );
  } catch (error: any) {
    console.error("Get users error:", error);
    return errorResponse("Failed to get users", 500);
  }
}
