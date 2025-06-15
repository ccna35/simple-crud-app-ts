// src/services/user.service.ts
import { pool } from "../config/db";
import { User } from "../interfaces";
import { UserModel } from "../models/user.model";

export class UserService {
  async getUserById(id: string): Promise<User | null> {
    return UserModel.findById(id);
  }

  async createUser(
    data: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<Omit<User, "hashedPassword">> {
    const user = new UserModel(data);

    // Here you would typically insert the user into the database
    // For example:
    await pool.execute(
      "INSERT INTO users (id, username, email, hashed_password, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        user.id,
        user.username,
        user.email,
        user.hashedPassword,
        user.firstName,
        user.lastName,
        user.createdAt,
        user.updatedAt,
      ]
    );

    return user.toJSON();
  }
}
