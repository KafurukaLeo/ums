/**
 * Data Transfer Object (DTO) for resend-verification.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationDto {
  /**
   * Unique email address used for authorization and notifications.
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
