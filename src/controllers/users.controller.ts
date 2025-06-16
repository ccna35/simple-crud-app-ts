import { Request, Response } from "express";
import { UserModel } from "../models/user.model";

export class UserController {
  // Get all users
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserModel.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error });
    }
  }

  // Get user by ID
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error });
    }
  }

  // Create new user
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const newUser = new UserModel(req.body);
      const savedUser = await newUser.save();
      res.status(201).json({
        message: "User created successfully",
        user: {
          ...savedUser.toJSON(),
          password: undefined
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Error creating user", error });
    }
  }

  // Update user
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        req.params.id,
        req.body
      );

      if (!updatedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser
      });
    } catch (error) {
      res.status(400).json({ message: "Error updating user", error });
    }
  }

  // Delete user
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const deletedUser = await UserModel.findByIdAndDelete(req.params.id);

      if (!deletedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user", error });
    }
  }
}
