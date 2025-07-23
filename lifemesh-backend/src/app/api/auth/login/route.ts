import { NextRequest } from "next/server";
import { loginSchema } from "../../../../utils/validation";
import { container } from "../../../../infrastructure/container";
import { successResponse, errorResponse } from "../../../../utils/api-response";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();

    // 2. Validate input
    const validatedData = loginSchema.parse(body);

    // 3. Execute use case
    const result = await container.loginUserUseCase.execute(validatedData);

    // 4. Return success response
    return successResponse(result, "Login successful");
  } catch (error: any) {
    console.error("Login error:", error);

    // Handle validation errors
    if (error.name === "ZodError") {
      return errorResponse(error.errors[0].message, 400);
    }

    // Handle business logic errors
    return errorResponse(error.message || "Login failed", 401);
  }
}
