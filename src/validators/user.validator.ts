import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name cannot exceed 100 characters")
    .describe("First name, 1-100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name cannot exceed 100 characters")
    .describe("Last name, 1-100 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters")
    .describe("Username, 3-50 characters"),
  email: z
    .string()
    .email("Invalid email format")
    .max(100, "Email cannot exceed 100 characters")
    .describe("A valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .describe("Password hash, minimum 6 characters")
});

export const updateUserSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(100, "First name cannot exceed 100 characters")
      .describe("First name, 1-100 characters")
      .optional(),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(100, "Last name cannot exceed 100 characters")
      .describe("Last name, 1-100 characters")
      .optional(),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username cannot exceed 50 characters")
      .describe("Username, 3-50 characters")
      .optional(),
    email: z
      .string()
      .email("Invalid email format")
      .max(100, "Email cannot exceed 100 characters")
      .describe("A valid email address")
      .optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .describe("Password hash, minimum 6 characters")
      .optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
    path: ["general"]
  });

export const idParamSchema = z.object({
  id: z.string().describe("User ID")
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
