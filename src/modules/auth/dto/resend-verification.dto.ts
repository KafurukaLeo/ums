/**
 * Data Transfer Object (DTO) for resend-verification.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
