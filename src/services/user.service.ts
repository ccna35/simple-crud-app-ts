import { UserModel } from "../models/user.model";
import * as bcrypt from "bcrypt";
import { z } from "zod";
import { User } from "../interfaces";
import {
  createUserSchema,
  updateUserSchema
} from "../validators/user.validator";

export class UserService {
  // Get all users
  async getAllUsers(): Promise<UserModel[]> {
    return UserModel.findAll();
  }

  // Get user by ID
  async getUserById(id: string): Promise<UserModel | null> {
    if (!id) {
      throw new Error("Invalid ID");
    }
    return UserModel.findById(id);
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<UserModel | null> {
    if (!z.string().email().safeParse(email).success) {
      throw new Error("Invalid email address");
    }
    return UserModel.findByEmail(email);
  }

  // Create a new user
  async createUser(
    data: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<UserModel> {
    const validatedData = createUserSchema.parse(data);

    // Check for duplicate email or username
    const existingUser = await UserModel.findByEmail(validatedData.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }
    const existingUsername = await UserModel.findAll();
    if (
      existingUsername.some((user) => user.username === validatedData.username)
    ) {
      throw new Error("Username already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user instance
    const user = new UserModel({
      ...validatedData,
      hashedPassword
    });

    // Save to database
    return user.save();
  }

  // Update a user
  async updateUser(id: string, data: Partial<User>): Promise<UserModel | null> {
    if (!id) {
      throw new Error("Invalid ID");
    }

    const validatedData = updateUserSchema.parse(data);
    const updateData: any = { ...validatedData };

    // Handle password hashing if provided
    if (validatedData.password) {
      updateData.hashedPassword = await bcrypt.hash(validatedData.password, 10);
      delete updateData.password;
    }

    // Check for duplicate email or username if provided
    if (validatedData.email) {
      const existingUser = await UserModel.findByEmail(validatedData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error("Email already exists");
      }
    }
    if (validatedData.username) {
      const existingUsers = await UserModel.findAll();
      if (
        existingUsers.some(
          (user) => user.username === validatedData.username && user.id !== id
        )
      ) {
        throw new Error("Username already exists");
      }
    }
    // Update in database
    return UserModel.findByIdAndUpdate(id, updateData);
  }

  // Delete a user
  async deleteUser(id: string): Promise<boolean> {
    if (!id) {
      throw new Error("Invalid ID");
    }
    return UserModel.findByIdAndDelete(id);
  }
}
