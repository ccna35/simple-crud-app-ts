import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, refreshTokenSchema } from "../validators/auth.validator";
import { VerificationController } from "../controllers/verification.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const authController = new AuthController();

// POST /api/auth/login - Login user
router.post("/login", validate(loginSchema), authController.login);

// POST /api/auth/refresh - Refresh access token
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken
);

const verificationController = new VerificationController();

// GET /api/auth/verify - Verify email with token
router.get("/verify", verificationController.verifyEmail);

// POST /api/auth/resend-verification - Resend verification email
router.post(
  "/resend-verification",
  authenticate,
  verificationController.resendVerification
);

export default router;
