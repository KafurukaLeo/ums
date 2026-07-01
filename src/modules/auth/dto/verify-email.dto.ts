/**
 * Data Transfer Object (DTO) for verify-email.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
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
}
