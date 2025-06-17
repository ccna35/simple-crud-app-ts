import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserService } from "./user.service";
import { AppError } from "../utils/error";
import { LoginInput } from "../validators/auth.validator";

export class AuthService {
  private userService: UserService;

  constructor(userService?: UserService) {
    this.userService = userService || new UserService();
  }

  async login(
    credentials: LoginInput
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    // Find user by username
    const user = await this.userService.findByUsername(credentials.username);

    if (!user) {
      throw new AppError("Invalid username or password", 401);
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid username or password", 401);
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.username);
    const refreshToken = this.generateRefreshToken(user.id);

    // Return user data (excluding sensitive information) and tokens
    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword
    };
  }

  generateAccessToken(userId: string, username: string): string {
    return jwt.sign(
      { id: userId, username },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" } as SignOptions
    );
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET || "your_refresh_secret",
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" } as SignOptions
    );
  }

  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "your_refresh_secret",
        async (err, decoded) => {
          if (err) {
            return reject(new AppError("Invalid refresh token", 401));
          }

          try {
            const { id } = decoded as { id: string };
            const user = await this.userService.getUserById(id);

            // Generate new access token
            const accessToken = this.generateAccessToken(
              user.id,
              user.username
            );

            resolve({ accessToken });
          } catch (error) {
            reject(new AppError("Error refreshing token", 500));
          }
        }
      );
    });
  }
}
