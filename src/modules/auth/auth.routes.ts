/**
 * Express Router defining API endpoints for the AUTH module.
 * Binds controller actions, applies input validation schemas, and enforces role-based access control.
 */
import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticateRefreshJwt } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const router = Router();

router.post('/register', validationMiddleware(RegisterDto), authController.register);
router.post('/login', validationMiddleware(LoginDto), authController.login);
router.post('/verify-email', validationMiddleware(VerifyEmailDto), authController.verifyEmail);
router.post('/resend-verification', validationMiddleware(ResendVerificationDto), authController.resendVerification);
router.post('/forgot-password', validationMiddleware(ForgotPasswordDto), authController.forgotPassword);
router.post('/reset-password', validationMiddleware(ResetPasswordDto), authController.resetPassword);
router.post('/refresh', authenticateRefreshJwt, authController.refresh);

export default router;
