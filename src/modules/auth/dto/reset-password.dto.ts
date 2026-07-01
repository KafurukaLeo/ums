/**
 * Data Transfer Object (DTO) for reset-password.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  /**
   * Unique email address used for authorization and notifications.
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * Associated property field: token.
   */
  @IsString()
  @IsNotEmpty()
  token: string;

  /**
   * Associated property field: newPassword.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
