import { z } from "zod";

// Validation schemas for input data
export const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

export const updateUserSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .optional(),
    email: z.string().email("Invalid email address").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
  });

// User validation schema for login
export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

// Helper function to validate with specific schema
export const validateUser = <T>(
  schema: z.ZodType<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  error?: z.ZodError;
} => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
};
