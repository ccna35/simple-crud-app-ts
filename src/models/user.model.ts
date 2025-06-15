// src/models/user.model.ts
import { Pool, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db"; // MySQL connection pool
import { User } from "../interfaces";

export class UserModel implements User {
  username: string;
  email: string;
  hashedPassword: string;
  firstName?: string;
  lastName?: string;

  constructor(data: User) {
    this.username = data.username;
    this.email = data.email;
    this.hashedPassword = data.hashedPassword;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
  }

  public toJSON(): Omit<User, "hashedPassword"> {
    const { hashedPassword, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  public static async findById(id: string): Promise<UserModel | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );
      const userData = rows[0];
      if (!userData) {
        return null;
      }
      return new UserModel({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        hashedPassword: userData.hashed_password,
        firstName: userData.first_name,
        lastName: userData.last_name,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Database query failed");
    }
  }
}
