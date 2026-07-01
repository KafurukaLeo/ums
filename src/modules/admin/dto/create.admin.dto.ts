/**
 * Data Transfer Object (DTO) for create.admin.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  /**
   * Full display name of the user or profile record.
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Unique email address used for authorization and notifications.
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * Hashed security password credentials.
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
