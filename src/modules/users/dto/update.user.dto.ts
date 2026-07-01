/**
 * Data Transfer Object (DTO) for update.user.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Role } from '../../../common/constants/role.enum';

export class UpdateUserDto {
  /**
   * Full display name of the user or profile record.
   */
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * Unique email address used for authorization and notifications.
   */
  @IsOptional()
  @IsEmail()
  email?: string;

  /**
   * User access role category (admin, lecturer, student).
   */
  @IsOptional()
  @IsString()
  role?: string;

  /**
   * Hashed security password credentials.
   */
  @IsOptional()
  @IsString()
  password?: string;

  /**
   * Boolean flag confirming if the email has been verified.
   */
  @IsOptional()
  isEmailVerified?: boolean;

  /**
   * Security token used to verify email ownership.
   */
  @IsOptional()
  @IsString()
  emailVerificationToken?: string;

  /**
   * Expiration timestamp for the email verification token.
   */
  @IsOptional()
  emailVerificationTokenExpires?: Date;

  /**
   * Security token used to verify password reset requests.
   */
  @IsOptional()
  @IsString()
  resetPasswordToken?: string;

  /**
   * Expiration timestamp for the password reset token.
   */
  @IsOptional()
  resetPasswordExpires?: Date;
}
