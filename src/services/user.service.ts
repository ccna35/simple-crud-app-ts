import bcrypt from "bcrypt";
import {
  CreateUserDTO,
  User,
  UserModel,
  UserResponse
} from "../models/User.model";
import { UserMySqlModel } from "../models/UserMySql.model";
import { AppError } from "../utils/error";
import logger from "../utils/logger";
import { VerificationService } from "./verification.service";

export class UserService {
  private userModel: UserModel;

  constructor(userModel?: UserModel) {
    this.userModel = userModel || new UserMySqlModel();
  }

  // Helper method to convert User to UserResponse (exclude password)
  private toUserResponse(user: User): UserResponse {
    // Pick only the fields we want to expose and format dates
    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      createdAt: user.createdAt ? user.createdAt.toISOString() : undefined,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : undefined,
      isVerified: user.isVerified || false, // Default to false if not set
      verifiedAt: user.verifiedAt ? user.verifiedAt.toISOString() : undefined // Format verifiedAt if it exists
    };
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await this.userModel.findAll();
    // Convert each user to a safe response object
    return users.map((user) => this.toUserResponse(user));
  }

  async getUserById(id: string): Promise<UserResponse> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new AppError(`User with id ${id} not found`, 404);
    }
    return this.toUserResponse(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findByEmail(email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findByUsername(username);
  }

  async createUser(
    userData: CreateUserDTO
  ): Promise<{ id: string; user: UserResponse }> {
    logger.debug("Creating new user", {
      email: userData.email,
      username: userData.username
    });

    // Check if user exists with the same email
    const existingUserByEmail = await this.findByEmail(userData.email);
    if (existingUserByEmail) {
      logger.warn(`User with email ${userData.email} already exists`, {
        email: userData.email
      });
      throw new AppError(
        `User with email ${userData.email} already exists`,
        409
      );
    }

    // Check if user exists with the same username
    const existingUserByUsername = await this.findByUsername(userData.username);
    if (existingUserByUsername) {
      logger.warn(`User with username ${userData.username} already exists`, {
        username: userData.username
      });
      throw new AppError(
        `User with username ${userData.username} already exists`,
        409
      );
    }
    // Hash password and create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const userToCreate = {
      ...userData,
      password: hashedPassword
    };

    const userId = await this.userModel.create(userToCreate);
    const newUser = await this.userModel.findById(userId);

    if (!newUser) {
      throw new AppError("Failed to retrieve created user", 500);
    }

    // Send verification email
    try {
      const verificationService = new VerificationService(this);
      await verificationService.sendVerificationEmail(userId, userData.email);
    } catch (error) {
      logger.error("Failed to send verification email", { userId, error });
      // We don't throw here to avoid failing the registration process
    }

    return {
      id: userId,
      user: this.toUserResponse(newUser)
    };
  }

  async updateUser(
    id: string,
    userData: Partial<CreateUserDTO>
  ): Promise<UserResponse> {
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) {
      throw new AppError(`User with id ${id} not found`, 404);
    }

    // If email is being updated, check if it already exists
    if (userData.email && userData.email !== existingUser.email) {
      const existingUserByEmail = await this.findByEmail(userData.email);
      if (existingUserByEmail) {
        throw new AppError(
          `User with email ${userData.email} already exists`,
          409
        );
      }
    }

    // If username is being updated, check if it already exists
    if (userData.username && userData.username !== existingUser.username) {
      const existingUserByUsername = await this.findByUsername(
        userData.username
      );
      if (existingUserByUsername) {
        throw new AppError(
          `User with username ${userData.username} already exists`,
          409
        );
      }
    }

    // If password is being updated, hash it
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    await this.userModel.update(id, userData);

    // Fetch the updated user
    const updatedUser = await this.userModel.findById(id);
    if (!updatedUser) {
      throw new AppError(`User with id ${id} not found after update`, 404);
    }

    return this.toUserResponse(updatedUser);
  }

  async deleteUser(id: string): Promise<boolean> {
    const userExists = await this.userModel.findById(id);
    if (!userExists) {
      throw new AppError(`User with id ${id} not found`, 404);
    }
    return this.userModel.delete(id);
  }

  // Method to mark a user as verified
  async markUserAsVerified(id: string, verifiedAt: Date): Promise<boolean> {
    return this.userModel.markAsVerified(id, verifiedAt);
  }
}
