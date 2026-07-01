import { Response } from 'express';
import { authService } from './auth.service';
import { asyncHandler } from '../../common/utils/async.util';

/**
 * Controller to handle all user Authentication processes.
 * Manages operations such as login, registration, email verification, password resets, and token refresh.
 */
export class AuthController {
  
  /**
   * Register a new user account.
   */
  register = asyncHandler(async (req: any, res: Response) => {
    const result = await authService.register(req.body);
    return result;
  });

  /**
   * Authenticate a user credentials and generate Access & Refresh JWT tokens.
   */
  login = asyncHandler(async (req: any, res: Response) => {
    const result = await authService.login(req.body);
    return result;
  });

  /**
   * Verify a user's email address using a verification token sent via email.
   */
  verifyEmail = asyncHandler(async (req: any, res: Response) => {
    const result = await authService.verifyEmail(req.body);
    return result;
  });

  /**
   * Resend the verification email to the user if they did not receive it.
   */
  resendVerification = asyncHandler(async (req: any, res: Response) => {
    const result = await authService.resendVerification(req.body);
    return result;
  });

  /**
   * Request a password reset link/token to be sent to the user's email.
   */
  forgotPassword = asyncHandler(async (req: any, res: Response) => {
    const result = await authService.forgotPassword(req.body);
    return result;
  });

  /**
   * Reset the user's password using a valid reset token.
   */
  resetPassword = asyncHandler(async (req: any, res: Response) => {
    const result = await authService.resetPassword(req.body);
    return result;
  });

  /**
   * Refresh expired access tokens using a valid refresh token.
   */
  refresh = asyncHandler(async (req: any, res: Response) => {
    const result = await authService.refreshTokens(req.user.id, req.user.email, req.user.role);
    return result;
  });
}

// Export singleton instance of AuthController
export const authController = new AuthController();
