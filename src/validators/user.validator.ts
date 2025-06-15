import { z } from "zod";

// User validation schema for creation
export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
});

// User validation schema for update
export const updateUserSchema = createUserSchema.partial();

// User validation schema for login
export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
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
