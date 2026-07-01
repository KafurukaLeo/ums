/**
 * Module components file: auth.service.ts.
 */
import { UnauthorizedException, ConflictException } from '../../common/exceptions/http.exception';
import * as jwt from 'jsonwebtoken';
import { usersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BcryptUtil } from '../../common/utils/bcrypt.util';
import { TokenUtil } from '../../common/utils/token.util';
import { emailService } from '../email/email.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { studentsService } from '../students/students.service';
import { lecturerService } from '../lecturers/lecturer.service';

/**
 * Simple internal Logger utility to log module operations.
 */
class Logger {
  constructor(private context: string) {}
  log(msg: string) { console.log(`[${this.context}] ${msg}`); }
  warn(msg: string) { console.warn(`[${this.context}] ${msg}`); }
  error(msg: string, err?: any) { console.error(`[${this.context}] ${msg}`, err || ''); }
}

/**
 * Authentication Service.
 * Manages user sign-up, sign-in, token generation, email verification, and password recovery.
 */
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /**
   * Register a new user and generate a verification code.
   * - Hashes password using Bcrypt.
   * - Automatically creates a corresponding Student or Lecturer profile depending on the role.
   * - Triggers a verification email to be sent.
   */
  async register(dto: RegisterDto) {
    // Check if email already exists
    const existing = await usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    
    // Hash password with Bcrypt
    const hashedPassword = await BcryptUtil.hash(dto.password);
    
    // Generate a secure verification code
    const verificationCode = TokenUtil.generateVerificationCode();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // Expires in 24 hours

    const role = dto.role || 'student';

    // Insert user into database
    const user = await usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role,
      isEmailVerified: false,
      emailVerificationToken: verificationCode,
      emailVerificationTokenExpires: verificationExpires,
    } as any);

    // Auto-create related entity profiles based on the role
    if (role === 'student') {
      try {
        await studentsService.create({
          name: dto.name,
          email: dto.email,
        } as any);
      } catch (err) {
        this.logger.error(`Failed to auto-create student profile for ${dto.email}`, err);
      }
    } else if (role === 'lecturer') {
      try {
        await lecturerService.create({
          name: dto.name,
          email: dto.email,
        } as any);
      } catch (err) {
        this.logger.error(`Failed to auto-create lecturer profile for ${dto.email}`, err);
      }
    }

    // Send registration verification email
    await emailService.sendVerificationEmail(user.email, verificationCode);

    // Filter out password and verification tokens from JSON response
    const { password: _, emailVerificationToken: __, ...userResponse } = user as any;

    const isMockEmail = !process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS;

    return {
      message: 'Registration successful. Please verify your email.',
      user: userResponse,
      ...(isMockEmail ? { devVerificationCode: verificationCode } : {}), // Expose code for dev environments if SMTP is missing
    };
  }

  /**
   * Log in user using credentials.
   * - Validates email and password correctness.
   * - Confirms that email has been verified.
   * - Loads entity profiles (studentId or lecturerId) for inclusion in JWT payloads.
   */
  async login(dto: LoginDto) {
    const user = await usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await BcryptUtil.compare(dto.password, user.password || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email not verified. Please verify your email first.');
    }

    // Issue new JWT token pairs
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    let studentProfile: any = null;
    let lecturerProfile: any = null;

    // Load related profiles to return to client
    if (user.role === 'student') {
      studentProfile = await studentsService.findByEmail(user.email);
    } else if (user.role === 'lecturer') {
      lecturerProfile = await lecturerService.findByEmail(user.email);
    }

    const { password: _, emailVerificationToken: __, resetPasswordToken: ___, ...userResponse } = user as any;
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        ...userResponse,
        studentProfile,
        lecturerProfile,
      },
    };
  }

  /**
   * Verify email address using the registration verification code.
   */
  async verifyEmail(dto: VerifyEmailDto) {
    const user = await usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or verification code');
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified' };
    }

    // Verify token correctness and expiration time
    if (
      !user.emailVerificationToken ||
      user.emailVerificationToken !== dto.token ||
      !user.emailVerificationTokenExpires ||
      new Date() > user.emailVerificationTokenExpires
    ) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // Update user status
    await usersService.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
    });

    await emailService.sendEmailVerifiedNotification(user.email, user.name);

    return { message: 'Email verified successfully. You can now log in.' };
  }

  /**
   * Resend verification email with a new code.
   */
  async resendVerification(dto: ResendVerificationDto) {
    const user = await usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified' };
    }

    const verificationCode = TokenUtil.generateVerificationCode();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    await usersService.update(user.id, {
      emailVerificationToken: verificationCode,
      emailVerificationTokenExpires: verificationExpires,
    });

    await emailService.sendVerificationEmail(user.email, verificationCode);

    const isMockEmail = !process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS;

    return {
      message: 'Verification code resent successfully.',
      ...(isMockEmail ? { devVerificationCode: verificationCode } : {}),
    };
  }

  /**
   * Handle forgot password request. Generates password reset token and emails it.
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await usersService.findByEmail(dto.email);
    if (!user) {
      // Return same response to prevent email enumerations security leaks
      return { message: 'If an account exists with this email, a password reset link has been sent.' };
    }

    const resetToken = TokenUtil.generateResetToken();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Expires in 1 hour

    await usersService.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    await emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If an account exists with this email, a password reset link has been sent.' };
  }

  /**
   * Reset user's password using reset token.
   */
  async resetPassword(dto: ResetPasswordDto) {
    const user = await usersService.findByEmail(dto.email);
    if (
      !user ||
      !user.resetPasswordToken ||
      user.resetPasswordToken !== dto.token ||
      !user.resetPasswordExpires ||
      new Date() > user.resetPasswordExpires
    ) {
      throw new UnauthorizedException('Invalid or expired password reset token');
    }

    const hashedPassword = await BcryptUtil.hash(dto.newPassword);

    await usersService.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    await emailService.sendPasswordResetSuccessEmail(user.email, user.name);

    return { message: 'Password reset successfully. You can now log in.' };
  }

  /**
   * Refresh JWT token pair.
   */
  async refreshTokens(userId: number, email: string, role: string) {
    return this.generateTokens(userId, email, role);
  }

  /**
   * Helper function to generate Access and Refresh JWT Tokens.
   * Resolves entity profile IDs to inject as claims in JWT payload.
   */
  private async generateTokens(userId: number, email: string, role: string) {
    let studentId: number | undefined;
    let lecturerId: number | undefined;

    if (role === 'student') {
      const student = await studentsService.findByEmail(email);
      if (student) {
        studentId = student.id;
      }
    } else if (role === 'lecturer') {
      const lecturer = await lecturerService.findByEmail(email);
      if (lecturer) {
        lecturerId = lecturer.id;
      }
    }

    // Payload configuration
    const payload = { sub: userId, email, role, studentId, lecturerId };
    
    // Sign Access Token (expires quickly, e.g. 15 mins)
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'super-secret-key', {
      expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
    });
    // Sign Refresh Token (expires slowly, e.g. 7 days)
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'super-refresh-secret-key', {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
    });
    return { accessToken, refreshToken };
  }
}

// Export singleton instance
export const authService = new AuthService();
