import { UserRepository } from "../interfaces/user-repository.interface";
import { User } from "../entities/user.entity";
import bcrypt from "bcryptjs";

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  user: Omit<User, "password">;
  token: string;
}

export class LoginUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JWTService
  ) {}

  async execute(request: LoginUserRequest): Promise<LoginUserResponse> {
    // 1. Find user by email
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // 2. Verify password
    const isValidPassword = await bcrypt.compare(
      request.password,
      user.password
    );
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // 3. Update last login
    await this.userRepository.updateLastLogin(user.id);

    // 4. Generate JWT token
    const token = this.jwtService.generateToken(user.id);
    console.log("Generated JWT token:", token);

    // 5. Return user without password
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }
}

// JWT Service interface
export interface JWTService {
  generateToken(userId: string): string;
  verifyToken(token: string): { userId: string } | null;
}
