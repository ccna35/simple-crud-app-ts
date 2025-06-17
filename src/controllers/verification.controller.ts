import { Request, Response, NextFunction } from "express";
import { VerificationService } from "../services/verification.service";
import { UserService } from "../services/user.service";
import { AppError } from "../utils/error";
import logger from "../utils/logger";

export class VerificationController {
  private verificationService: VerificationService;
  private userService: UserService;

  constructor(verificationService?: VerificationService, userService?: UserService) {
    this.userService = userService || new UserService();
    this.verificationService = verificationService || new VerificationService(this.userService);
  }

  verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== "string") {
        throw new AppError("Verification token is required", 400);
      }
      
      await this.verificationService.verifyUser(token);
      
      // Decide if you want to redirect or return a JSON response
      if (req.accepts("html")) {
        // Redirect to frontend verification success page
        res.redirect(`${process.env.FRONTEND_URL || "/"}/verification-success`);
      } else {
        res.status(200).json({
          success: true,
          message: "Email verification successful"
        });
      }
    } catch (error) {
      next(error);
    }
  };

  resendVerification = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // This endpoint should be protected to ensure the user is requesting their own verification
      const { userId } = req.body;
      
      if (!userId) {
        throw new AppError("User ID is required", 400);
      }
      
      // Check if user exists and is not already verified
      const user = await this.userService.getUserById(userId);
      
      if (user.isVerified) {
        throw new AppError("User is already verified", 400);
      }
      
      // Send verification email
      const sent = await this.verificationService.sendVerificationEmail(userId, user.email);
      
      if (!sent) {
        throw new AppError("Failed to send verification email", 500);
      }
      
      res.status(200).json({
        success: true,
        message: "Verification email sent successfully"
      });
    } catch (error) {
      next(error);
    }
  };
}