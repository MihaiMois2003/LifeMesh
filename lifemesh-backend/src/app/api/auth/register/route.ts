import { NextRequest } from "next/server";
import { registerSchema } from "../../../../utils/validation";
import { container } from "../../../../infrastructure/container";
import { successResponse, errorResponse } from "../../../../utils/api-response";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();

    // 2. Validate input
    const validatedData = registerSchema.parse(body);

    // 3. Execute use case
    const user = await container.registerUserUseCase.execute(validatedData);

    // 4. Remove password from response
    const { password, ...userResponse } = user;

    // 5. Return success response
    return successResponse(userResponse, "User registered successfully");
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle validation errors
    if (error.name === "ZodError") {
      return errorResponse(error.errors[0].message, 400);
    }

    // Handle business logic errors
    return errorResponse(error.message || "Registration failed", 400);
  }
}
