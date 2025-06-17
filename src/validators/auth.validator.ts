import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .describe("Username for login"),
  password: z
    .string()
    .min(1, "Password is required")
    .describe("Password for login")
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .nonempty("Refresh token is required")
    .describe("Refresh token for generating new access token")
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;