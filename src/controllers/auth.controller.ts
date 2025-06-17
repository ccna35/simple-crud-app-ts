import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginInput, RefreshTokenInput } from '../validators/auth.validator';

export class AuthController {
  private authService: AuthService;
  
  constructor(authService?: AuthService) {
    this.authService = authService || new AuthService();
  }
  
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const credentials: LoginInput = req.body;
      const result = await this.authService.login(credentials);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
  
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken }: RefreshTokenInput = req.body;
      const result = await this.authService.refreshAccessToken(refreshToken);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}