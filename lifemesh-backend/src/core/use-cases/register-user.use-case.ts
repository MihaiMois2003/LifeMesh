import { UserRepository } from "../interfaces/user-repository.interface";
import { CreateUserData, User } from "../entities/user.entity";
import bcrypt from "bcryptjs";

export interface RegisterUserRequest {
  email: string;
  username: string;
  password: string;
  displayName?: string;
  latitude?: number;
  longitude?: number;
}

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: RegisterUserRequest): Promise<User> {
    // 1. Validate input
    await this.validateUserData(request);

    // 2. Create user
    const userData: CreateUserData = {
      email: request.email.toLowerCase(),
      username: request.username.toLowerCase(),
      password: request.password,
      displayName: request.displayName,
      latitude: request.latitude,
      longitude: request.longitude,
    };

    return await this.userRepository.create(userData);
  }

  private async validateUserData(request: RegisterUserRequest): Promise<void> {
    // Check if email already exists
    const existingEmail = await this.userRepository.findByEmail(request.email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findByUsername(
      request.username
    );
    if (existingUsername) {
      throw new Error("Username already exists");
    }

    // Basic validation
    if (!request.email || !request.username || !request.password) {
      throw new Error("Email, username, and password are required");
    }

    if (request.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
  }
}
