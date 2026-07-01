/**
 * Data Transfer Object (DTO) for forgot-password.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  /**
   * Unique email address used for authorization and notifications.
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
