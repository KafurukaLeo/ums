/**
 * Data Transfer Object (DTO) for login.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  /**
   * Unique email address used for authorization and notifications.
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * Hashed security password credentials.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
