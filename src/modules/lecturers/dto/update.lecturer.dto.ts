/**
 * Data Transfer Object (DTO) for update.lecturer.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateLecturerDto {
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
}
