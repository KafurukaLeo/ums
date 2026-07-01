/**
 * Data Transfer Object (DTO) for update.admin.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAdminDto {
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
   * Hashed security password credentials.
   */
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
