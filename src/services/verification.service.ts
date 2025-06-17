import { v4 as uuidv4 } from "uuid";
import { UserService } from "./user.service";
import { EmailService } from "./email.service";
import { VerificationTokenModel } from "../models/verificationToken.model";
import { VerificationTokenMySqlModel } from "../models/verificationTokenMySql.model";
import { AppError } from "../utils/error";
import logger from "../utils/logger";

export class VerificationService {
  private userService: UserService;
  private tokenModel: VerificationTokenModel;
  private emailService: EmailService;
  private tokenExpiryHours: number;

  constructor(
    userService?: UserService,
    tokenModel?: VerificationTokenModel,
    emailService?: EmailService
  ) {
    this.userService = userService || new UserService();
    this.tokenModel = tokenModel || new VerificationTokenMySqlModel();
    this.emailService = emailService || new EmailService();
    this.tokenExpiryHours = parseInt(process.env.VERIFICATION_TOKEN_EXPIRY_HOURS || "24", 10);
  }

  async generateVerificationToken(userId: string): Promise<string> {
    // Delete any existing tokens for this user
    await this.tokenModel.deleteByUserId(userId);

    // Generate new token
    const token = uuidv4();
    
    // Set expiration (e.g., 24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.tokenExpiryHours);
    
    // Save token
    await this.tokenModel.create(userId, token, expiresAt);
    
    return token;
  }

  async sendVerificationEmail(userId: string, email: string): Promise<boolean> {
    try {
      // Generate token
      const token = await this.generateVerificationToken(userId);
      
      // Create verification URL
      const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;
      
      // Send email
      const emailSent = await this.emailService.sendEmail({
        to: email,
        subject: "Verify Your Email Address",
        template: "verification",
        context: {
          verificationUrl,
          expiryHours: this.tokenExpiryHours
        }
      });
      
      logger.info("Verification email sent", { userId, email });
      return emailSent;
    } catch (error) {
      logger.error("Failed to send verification email", { userId, email, error });
      return false;
    }
  }

  async verifyUser(token: string): Promise<boolean> {
    // Find token in the database
    const tokenRecord = await this.tokenModel.findByToken(token);
    
    if (!tokenRecord) {
      throw new AppError("Invalid or expired verification token", 400);
    }
    
    // Check if token is expired
    if (new Date(tokenRecord.expiresAt) < new Date()) {
      await this.tokenModel.deleteByToken(token);
      throw new AppError("Verification token has expired", 400);
    }
    
    // Mark user as verified
    const verifiedAt = new Date();
    const updated = await this.userService.markUserAsVerified(tokenRecord.userId, verifiedAt);
    
    if (!updated) {
      throw new AppError("Failed to verify user", 500);
    }
    
    // Delete the used token
    await this.tokenModel.deleteByToken(token);
    
    logger.info("User verified successfully", { userId: tokenRecord.userId });
    return true;
  }

  async cleanupExpiredTokens(): Promise<number> {
    const deletedCount = await this.tokenModel.deleteExpired();
    logger.info("Expired verification tokens cleaned up", { count: deletedCount });
    return deletedCount;
  }
}