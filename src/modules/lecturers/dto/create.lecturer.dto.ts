/**
 * Data Transfer Object (DTO) for create.lecturer.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateLecturerDto {
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
}
