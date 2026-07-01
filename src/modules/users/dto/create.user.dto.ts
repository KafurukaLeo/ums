/**
 * Data Transfer Object (DTO) for create.user.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '../../../common/constants/role.enum';

export class CreateUserDto {
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
  password: string;

  /**
   * User access role category (admin, lecturer, student).
   */
  @IsOptional()
  @IsString()
  role?: string;
}
