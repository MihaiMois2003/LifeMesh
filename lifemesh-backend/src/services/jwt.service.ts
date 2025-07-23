import jwt from "jsonwebtoken";
import { JWTService } from "../core/use-cases/login-user.use-case";

export class JWTServiceImpl implements JWTService {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || "fallback-secret";
  }

  generateToken(userId: string): string {
    // Fix: Use a number instead of string for expiresIn
    return jwt.sign(
      { userId },
      this.secret,
      { expiresIn: 60 * 60 * 24 * 7 } // 7 days in seconds (number)
    );
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, this.secret) as { userId: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
