import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BcryptUtil } from '../../common/utils/bcrypt.util';
import { TokenUtil } from '../../common/utils/token.util';
import { EmailService } from '../email/email.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { StudentsService } from '../students/students.service';
import { LecturerService } from '../lecturers/lecturer.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly studentsService: StudentsService,
    private readonly lecturerService: LecturerService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const hashedPassword = await BcryptUtil.hash(dto.password);
    
    const verificationCode = TokenUtil.generateVerificationCode();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    const role = dto.role || 'student';

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role,
      isEmailVerified: false,
      emailVerificationToken: verificationCode,
      emailVerificationTokenExpires: verificationExpires,
    } as any);

    // Auto-create student/lecturer profile during user registration
    if (role === 'student') {
      try {
        await this.studentsService.create({
          name: dto.name,
          email: dto.email,
        } as any);
      } catch (err) {
        this.logger.error(`Failed to auto-create student profile for ${dto.email}`, err);
      }
    } else if (role === 'lecturer') {
      try {
        await this.lecturerService.create({
          name: dto.name,
          email: dto.email,
        } as any);
      } catch (err) {
        this.logger.error(`Failed to auto-create lecturer profile for ${dto.email}`, err);
      }
    }

    await this.emailService.sendVerificationEmail(user.email, verificationCode);

    const { password: _, emailVerificationToken: __, ...userResponse } = user as any;

    const isMockEmail = !process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS;

    return {
      message: 'Registration successful. Please verify your email.',
      user: userResponse,
      ...(isMockEmail ? { devVerificationCode: verificationCode } : {}),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
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

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    let studentProfile: any = null;
    let lecturerProfile: any = null;

    if (user.role === 'student') {
      studentProfile = await this.studentsService.findByEmail(user.email);
    } else if (user.role === 'lecturer') {
      lecturerProfile = await this.lecturerService.findByEmail(user.email);
    }

    const { password: _, emailVerificationToken: __, resetPasswordToken: ___, ...userResponse } = user as any;
    return {
      user: {
        ...userResponse,
        studentProfile,
        lecturerProfile,
      },
      ...tokens,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or verification code');
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified' };
    }

    if (
      !user.emailVerificationToken ||
      user.emailVerificationToken !== dto.token ||
      !user.emailVerificationTokenExpires ||
      new Date() > user.emailVerificationTokenExpires
    ) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    await this.usersService.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
    });

    // Send confirmation notification that email is now verified
    await this.emailService.sendEmailVerifiedNotification(user.email, user.name);

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified' };
    }

    const verificationCode = TokenUtil.generateVerificationCode();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    await this.usersService.update(user.id, {
      emailVerificationToken: verificationCode,
      emailVerificationTokenExpires: verificationExpires,
    });

    await this.emailService.sendVerificationEmail(user.email, verificationCode);

    const isMockEmail = !process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS;

    return {
      message: 'Verification code resent successfully.',
      ...(isMockEmail ? { devVerificationCode: verificationCode } : {}),
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return { message: 'If an account exists with this email, a password reset link has been sent.' };
    }

    const resetToken = TokenUtil.generateResetToken();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    await this.usersService.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If an account exists with this email, a password reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
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

    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    // Send confirmation notification that password was successfully changed
    await this.emailService.sendPasswordResetSuccessEmail(user.email, user.name);

    return { message: 'Password reset successfully. You can now log in.' };
  }

  async refreshTokens(userId: number, email: string, role: string) {
    return this.generateTokens(userId, email, role);
  }

  private async generateTokens(userId: number, email: string, role: string) {
    let studentId: number | undefined;
    let lecturerId: number | undefined;

    if (role === 'student') {
      const student = await this.studentsService.findByEmail(email);
      if (student) {
        studentId = student.id;
      }
    } else if (role === 'lecturer') {
      const lecturer = await this.lecturerService.findByEmail(email);
      if (lecturer) {
        lecturerId = lecturer.id;
      }
    }

    const payload = { sub: userId, email, role, studentId, lecturerId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'super-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-refresh-secret-key',
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
