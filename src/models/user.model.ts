// src/models/user.model.ts
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db"; // MySQL connection pool
import { User } from "../interfaces";

export class UserModel implements User {
  id?: string; // Optional, will be set after saving
  firstName?: string;
  lastName?: string;
  createdAt?: Date; // Optional, will be set after saving
  updatedAt?: Date; // Optional, will be set after saving
  // Required fields
  username: string;
  email: string;
  hashedPassword: string;

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

  // find all users without password
  public static async findAll(): Promise<UserModel[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT id, username, email, first_name, last_name FROM users"
      );
      return rows.map(
        (row) =>
          new UserModel({
            id: row.id,
            username: row.username,
            email: row.email,
            hashedPassword: "", // Not returned
            firstName: row.first_name,
            lastName: row.last_name,
          })
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Database query failed");
    }
  }

  public async save(): Promise<UserModel> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        "INSERT INTO users (username, email, hashed_password, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
        [
          this.username,
          this.email,
          this.hashedPassword,
          this.firstName,
          this.lastName,
        ]
      );

      this.id = result.insertId.toString(); // Convert to string if needed
      return this;
    } catch (error) {
      console.error("Error saving user:", error);
      throw new Error("Database insert failed");
    }
  }

  // findByIdAndUpdate
  public static async findByIdAndUpdate(
    id: string,
    data: Partial<User>
  ): Promise<UserModel | null> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        "UPDATE users SET username = ?, email = ?, hashed_password = ?, first_name = ?, last_name = ? WHERE id = ?",
        [
          data.username,
          data.email,
          data.hashedPassword,
          data.firstName,
          data.lastName,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return null; // No user found with the given ID
      }

      return UserModel.findById(id); // Return the updated user
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Database update failed");
    }
  }

  // findByIdAndDelete
  public static async findByIdAndDelete(id: string): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        "DELETE FROM users WHERE id = ?",
        [id]
      );
      return result.affectedRows > 0; // Return true if a user was deleted
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Database delete failed");
    }
  }

  // findByEmail
  public static async findByEmail(email: string): Promise<UserModel | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM users WHERE email = ?",
        [email]
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
      console.error("Error fetching user by email:", error);
      throw new Error("Database query failed");
    }
  }
}
